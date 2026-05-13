from pathlib import Path
from contextlib import closing
import tempfile
import unittest

import server


class ServerBusinessRulesTest(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.original_db_path = server.DB_PATH
        server.DB_PATH = Path(self.tempdir.name) / "autoosta-test.db"
        server.init_database()

    def tearDown(self):
        server.DB_PATH = self.original_db_path
        self.tempdir.cleanup()

    def register(self, username="janis", age=30):
        return server.register_user(
            {
                "username": username,
                "firstName": "Jānis",
                "lastName": "Bērziņš",
                "age": age,
                "password": "Parole!1",
            }
        )

    def test_registration_hashes_password_and_hides_hash(self):
        user = self.register()

        self.assertEqual(user["username"], "janis")
        self.assertNotIn("passwordHash", user)

        with closing(server.connect()) as conn:
            row = conn.execute(
                "SELECT password_hash FROM users WHERE username = ?",
                ("janis",),
            ).fetchone()

        self.assertTrue(row["password_hash"].startswith("pbkdf2_sha256$"))
        self.assertTrue(server.verify_password("Parole!1", row["password_hash"]))

    def test_duplicate_usernames_are_rejected_case_insensitively(self):
        self.register(username="Ruta")

        with self.assertRaises(server.ApiError):
            self.register(username="ruta")

    def test_driver_application_checks_age_minus_experience(self):
        self.register(username="soferis", age=20)

        with self.assertRaises(server.ApiError):
            server.apply_driver(
                {
                    "username": "soferis",
                    "licenseNumber": "LV-123",
                    "experienceYears": 3,
                    "motivation": "Vēlos vadīt autobusu.",
                }
            )

        result = server.apply_driver(
            {
                "username": "soferis",
                "licenseNumber": "LV-123",
                "experienceYears": 2,
                "motivation": "Vēlos vadīt autobusu.",
            }
        )
        self.assertTrue(result["user"]["isDriver"])

    def test_top_up_limit_is_enforced(self):
        self.register(username="pirc")

        with self.assertRaises(server.ApiError):
            server.top_up_user({"username": "pirc", "amount": 250})

        result = server.top_up_user({"username": "pirc", "amount": 50})
        self.assertEqual(result["user"]["balance"], 50)

    def test_ticket_purchase_is_atomic_and_deducts_balance(self):
        self.register(username="pirc")
        server.top_up_user({"username": "pirc", "amount": 10})
        server.put_item(
            "routes",
            {
                "id": "tests-riga-ogre",
                "name": "Rīga - Ogre",
                "start": "Rīga SAO",
                "end": "Ogre AO",
                "stops": ["Salaspils", "Ikšķile", "Jaunogre"],
                "schedules": [{"departure": "08:00", "arrival": "08:45"}],
                "departure": "08:00",
                "arrival": "08:45",
                "scheduleMode": "manual",
                "price": 4.2,
                "driverUsername": "sistema",
                "createdAt": "2026-05-12T08:00:00.000Z",
                "updatedAt": "2026-05-12T08:00:00.000Z",
            },
        )

        result = server.purchase_ticket(
            {
                "username": "pirc",
                "routeId": "tests-riga-ogre",
                "scheduleId": "tests-riga-ogre-time-0",
                "ticketNumber": "AIS-TEST",
            }
        )

        self.assertEqual(result["purchase"]["ticketNumber"], "AIS-TEST")
        self.assertAlmostEqual(result["user"]["balance"], 5.8)


if __name__ == "__main__":
    unittest.main()
