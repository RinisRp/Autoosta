from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import hmac
import json
import os
import re
import sqlite3
import sys
import urllib.parse
import uuid


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "autoosta.db"
SCHEMA_PATH = ROOT / "database" / "schema.sql"
STORE_NAMES = {"users", "routes", "purchases", "driverApplications", "topUps"}
PASSWORD_ITERATIONS = 120_000
PASSWORD_SPECIALS = r"""!@#$%^&*()_+-=[]{};':"\|,.<>/?`~"""


class ApiError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def create_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def normalize_username(username):
    return str(username or "").strip().lower()


def validate_password_policy(password):
    if len(password or "") < 8:
        raise ApiError("Parolei jābūt vismaz 8 simbolus garai.")
    if not re.search(r"[A-Z]", password):
        raise ApiError("Parolē jābūt vismaz vienam lielajam burtam.")
    if not re.search(r"\d", password):
        raise ApiError("Parolē jābūt vismaz vienam ciparam.")
    if not any(char in PASSWORD_SPECIALS for char in password):
        raise ApiError("Parolē jābūt vismaz vienam speciālajam simbolam.")


def hash_password(password):
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest}"


def verify_password(password, stored_hash):
    stored_hash = stored_hash or ""
    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            _algorithm, iterations, salt_hex, expected = stored_hash.split("$", 3)
            digest = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                bytes.fromhex(salt_hex),
                int(iterations),
            ).hex()
            return hmac.compare_digest(digest, expected)
        except (ValueError, TypeError):
            return False

    legacy_sha256 = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_sha256, stored_hash)


def find_user_row(conn, username):
    return conn.execute(
        "SELECT * FROM users WHERE lower(username) = lower(?)",
        (str(username or "").strip(),),
    ).fetchone()


def init_database():
    with closing(connect()) as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.execute(
            """
            INSERT OR IGNORE INTO users (
                username, first_name, last_name, age, password_hash, balance,
                is_driver, is_station_manager, created_at, updated_at
            )
            VALUES ('sistema', 'Sistēma', 'Autoosta', 99, '', 0, 1, 1,
                    '2026-05-03T08:00:00.000Z', '2026-05-03T08:00:00.000Z')
            """
        )
        system_user = conn.execute(
            "SELECT password_hash FROM users WHERE username = 'sistema'"
        ).fetchone()
        if system_user and not str(system_user["password_hash"] or "").startswith("pbkdf2_sha256$"):
            conn.execute(
                "UPDATE users SET password_hash = ? WHERE username = 'sistema'",
                (hash_password("Sistema!1"),),
            )
        conn.commit()


def bool_to_int(value):
    return 1 if value else 0


def row_to_user(row):
    return {
        "username": row["username"],
        "firstName": row["first_name"],
        "lastName": row["last_name"],
        "age": row["age"],
        "balance": row["balance"],
        "isDriver": bool(row["is_driver"]),
        "isStationManager": bool(row["is_station_manager"]),
        "driverSince": row["driver_since"],
        "stationManagerSince": row["station_manager_since"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def row_to_driver_application(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "firstName": row["first_name"],
        "lastName": row["last_name"],
        "licenseNumber": row["license_number"],
        "experienceYears": row["experience_years"],
        "motivation": row["motivation"],
        "createdAt": row["created_at"],
    }


def route_from_row(conn, row):
    stops = [
        item["stop_name"]
        for item in conn.execute(
            "SELECT stop_name FROM route_stops WHERE route_id = ? ORDER BY sequence_number",
            (row["id"],),
        )
    ]
    schedules = [
        {
            "id": item["id"],
            "departure": item["departure"],
            "arrival": item["arrival"],
        }
        for item in conn.execute(
            "SELECT id, departure, arrival FROM route_schedules WHERE route_id = ? ORDER BY sequence_number",
            (row["id"],),
        )
    ]
    recurrence = None
    if row["schedule_mode"] == "repeat":
        recurrence = {
            "startTime": row["recurrence_start_time"],
            "endTime": row["recurrence_end_time"],
            "intervalMinutes": row["recurrence_interval_minutes"],
            "durationMinutes": row["recurrence_duration_minutes"],
        }

    return {
        "id": row["id"],
        "name": row["name"],
        "start": row["start_point"],
        "end": row["end_point"],
        "stops": stops,
        "schedules": schedules,
        "departure": row["departure"],
        "arrival": row["arrival"],
        "scheduleMode": row["schedule_mode"],
        "recurrence": recurrence,
        "price": row["price"],
        "driverUsername": row["driver_username"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def row_to_purchase(row):
    return {
        "id": row["id"],
        "ticketNumber": row["ticket_number"],
        "username": row["username"],
        "firstName": row["first_name"],
        "lastName": row["last_name"],
        "routeId": row["route_id"],
        "routeName": row["route_name"],
        "start": row["start_point"],
        "end": row["end_point"],
        "departure": row["departure"],
        "arrival": row["arrival"],
        "scheduleId": row["schedule_id"],
        "price": row["price"],
        "paid": bool(row["paid"]),
        "createdAt": row["created_at"],
    }


def row_to_top_up(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "firstName": row["first_name"],
        "lastName": row["last_name"],
        "amount": row["amount"],
        "balanceAfter": row["balance_after"],
        "createdAt": row["created_at"],
    }


def get_all(store_name):
    with closing(connect()) as conn:
        if store_name == "users":
            return [row_to_user(row) for row in conn.execute("SELECT * FROM users")]
        if store_name == "driverApplications":
            return [
                row_to_driver_application(row)
                for row in conn.execute("SELECT * FROM driver_applications")
            ]
        if store_name == "routes":
            return [
                route_from_row(conn, row)
                for row in conn.execute("SELECT * FROM routes")
            ]
        if store_name == "purchases":
            return [row_to_purchase(row) for row in conn.execute("SELECT * FROM purchases")]
        if store_name == "topUps":
            return [row_to_top_up(row) for row in conn.execute("SELECT * FROM top_ups")]
    raise ValueError("Unknown store")


def get_one(store_name, key):
    with closing(connect()) as conn:
        if store_name == "users":
            row = conn.execute("SELECT * FROM users WHERE username = ?", (key,)).fetchone()
            return row_to_user(row) if row else None
        if store_name == "driverApplications":
            row = conn.execute("SELECT * FROM driver_applications WHERE id = ?", (key,)).fetchone()
            return row_to_driver_application(row) if row else None
        if store_name == "routes":
            row = conn.execute("SELECT * FROM routes WHERE id = ?", (key,)).fetchone()
            return route_from_row(conn, row) if row else None
        if store_name == "purchases":
            row = conn.execute("SELECT * FROM purchases WHERE id = ?", (key,)).fetchone()
            return row_to_purchase(row) if row else None
        if store_name == "topUps":
            row = conn.execute("SELECT * FROM top_ups WHERE id = ?", (key,)).fetchone()
            return row_to_top_up(row) if row else None
    raise ValueError("Unknown store")


def register_user(item):
    first_name = str(item.get("firstName") or "").strip()
    last_name = str(item.get("lastName") or "").strip()
    username = str(item.get("username") or "").strip()
    password = str(item.get("password") or "")

    if not first_name or not last_name:
        raise ApiError("Vārds un uzvārds ir obligāti jāieraksta.")
    if not username:
        raise ApiError("Ievadi konta nosaukumu.")

    try:
        age = int(item.get("age"))
    except (TypeError, ValueError):
        raise ApiError("Vecumam jābūt no 1 līdz 120.")
    if age < 1 or age > 120:
        raise ApiError("Vecumam jābūt no 1 līdz 120.")

    validate_password_policy(password)

    with closing(connect()) as conn:
        if find_user_row(conn, username):
            raise ApiError("Šāds konta nosaukums jau eksistē. Izvēlies citu.")

        created_at = now_iso()
        conn.execute(
            """
            INSERT INTO users (
                username, first_name, last_name, age, password_hash, balance,
                is_driver, is_station_manager, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
            """,
            (username, first_name, last_name, age, hash_password(password), created_at, created_at),
        )
        conn.commit()

    return get_one("users", username)


def login_user(item):
    username = str(item.get("username") or "").strip()
    password = str(item.get("password") or "")
    if not username or not password:
        raise ApiError("Ievadi konta nosaukumu un paroli.")

    with closing(connect()) as conn:
        row = find_user_row(conn, username)
        if not row or not verify_password(password, row["password_hash"]):
            raise ApiError("Nepareizs konta nosaukums vai parole.", 401)

        if not str(row["password_hash"] or "").startswith("pbkdf2_sha256$"):
            conn.execute(
                "UPDATE users SET password_hash = ?, updated_at = ? WHERE username = ?",
                (hash_password(password), now_iso(), row["username"]),
            )
            conn.commit()
            row = find_user_row(conn, username)

        return row_to_user(row)


def top_up_user(item):
    username = str(item.get("username") or "").strip()
    try:
        amount = round(float(item.get("amount")), 2)
    except (TypeError, ValueError):
        raise ApiError("Summa nav atbilstoša. Ievadi vairāk par 0 EUR un ne vairāk par 200 EUR.")

    if amount <= 0 or amount > 200:
        raise ApiError("Summa nav atbilstoša. Ievadi vairāk par 0 EUR un ne vairāk par 200 EUR.")

    with closing(connect()) as conn:
        row = find_user_row(conn, username)
        if not row:
            raise ApiError("Lietotājs nav atrasts.", 404)

        balance_after = round(float(row["balance"] or 0) + amount, 2)
        created_at = now_iso()
        top_up_id = item.get("id") or create_id("topup")
        conn.execute(
            "UPDATE users SET balance = ?, updated_at = ? WHERE username = ?",
            (balance_after, created_at, row["username"]),
        )
        conn.execute(
            """
            INSERT INTO top_ups (id, username, first_name, last_name, amount, balance_after, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                top_up_id,
                row["username"],
                row["first_name"],
                row["last_name"],
                amount,
                balance_after,
                created_at,
            ),
        )
        conn.commit()

    return {"user": get_one("users", username), "topUp": get_one("topUps", top_up_id)}


def purchase_ticket(item):
    username = str(item.get("username") or "").strip()
    route_id = str(item.get("routeId") or "").strip()
    schedule_id = str(item.get("scheduleId") or "").strip()

    with closing(connect()) as conn:
        user = find_user_row(conn, username)
        if not user:
            raise ApiError("Lietotājs nav atrasts.", 404)

        route = conn.execute("SELECT * FROM routes WHERE id = ?", (route_id,)).fetchone()
        if not route:
            raise ApiError("Maršruts nav atrasts.", 404)

        schedule = None
        if schedule_id:
            schedule = conn.execute(
                "SELECT * FROM route_schedules WHERE id = ? AND route_id = ?",
                (schedule_id, route_id),
            ).fetchone()
        if not schedule:
            schedule = conn.execute(
                "SELECT * FROM route_schedules WHERE route_id = ? ORDER BY sequence_number LIMIT 1",
                (route_id,),
            ).fetchone()
        if not schedule:
            raise ApiError("Maršrutam nav neviena reisa laika.")

        price = round(float(route["price"] or 0), 2)
        balance = round(float(user["balance"] or 0), 2)
        if balance < price:
            raise ApiError("Nav pietiekami apmaksas līdzekļi. Papildini konta bilansi.")

        created_at = now_iso()
        purchase_id = item.get("id") or create_id("purchase")
        ticket_number = item.get("ticketNumber") or f"AIS-{uuid.uuid4().hex[:8].upper()}"
        new_balance = round(balance - price, 2)

        conn.execute(
            "UPDATE users SET balance = ?, updated_at = ? WHERE username = ?",
            (new_balance, created_at, user["username"]),
        )
        conn.execute(
            """
            INSERT INTO purchases (
                id, ticket_number, username, first_name, last_name,
                route_id, route_name, start_point, end_point, departure,
                arrival, schedule_id, price, paid, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            """,
            (
                purchase_id,
                ticket_number,
                user["username"],
                user["first_name"],
                user["last_name"],
                route["id"],
                route["name"],
                route["start_point"],
                route["end_point"],
                schedule["departure"],
                schedule["arrival"],
                schedule["id"],
                price,
                created_at,
            ),
        )
        conn.commit()

    return {"user": get_one("users", username), "purchase": get_one("purchases", purchase_id)}


def apply_driver(item):
    username = str(item.get("username") or "").strip()
    license_number = str(item.get("licenseNumber") or "").strip()
    motivation = str(item.get("motivation") or "").strip()
    try:
        experience_years = int(item.get("experienceYears"))
    except (TypeError, ValueError):
        raise ApiError("Pieredzes gadu skaitam jābūt korektam skaitlim.")

    if not license_number or experience_years < 0 or not motivation:
        raise ApiError("Aizpildi visus šofera pieteikuma jautājumus.")

    with closing(connect()) as conn:
        user = find_user_row(conn, username)
        if not user:
            raise ApiError("Lietotājs nav atrasts.", 404)
        if int(user["age"]) - experience_years < 18:
            raise ApiError("Tas nav iespējams, jo vadītāja tiesības var būt tikai no 18 gadu vecuma.")

        created_at = now_iso()
        application_id = item.get("id") or create_id("driver")
        conn.execute(
            """
            INSERT INTO driver_applications (
                id, username, first_name, last_name, license_number,
                experience_years, motivation, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                application_id,
                user["username"],
                user["first_name"],
                user["last_name"],
                license_number,
                experience_years,
                motivation,
                created_at,
            ),
        )
        conn.execute(
            "UPDATE users SET is_driver = 1, driver_since = ?, updated_at = ? WHERE username = ?",
            (created_at, created_at, user["username"]),
        )
        conn.commit()

    return {
        "user": get_one("users", username),
        "application": get_one("driverApplications", application_id),
    }


def become_station_manager(item):
    username = str(item.get("username") or "").strip()
    with closing(connect()) as conn:
        user = find_user_row(conn, username)
        if not user:
            raise ApiError("Lietotājs nav atrasts.", 404)
        if not bool(user["is_driver"]):
            raise ApiError("Par autoostas vadītāju var kļūt tikai autobusa vadītājs.")

        changed_at = now_iso()
        conn.execute(
            """
            UPDATE users
            SET is_station_manager = 1, station_manager_since = ?, updated_at = ?
            WHERE username = ?
            """,
            (changed_at, changed_at, user["username"]),
        )
        conn.commit()

    return get_one("users", username)


def put_item(store_name, item):
    with closing(connect()) as conn:
        if store_name == "users":
            username = str(item.get("username") or "").strip()
            if not username:
                raise ApiError("Ievadi konta nosaukumu.")
            existing = find_user_row(conn, username)
            first_name = str(item.get("firstName") or "").strip()
            last_name = str(item.get("lastName") or "").strip()
            if not first_name or not last_name:
                raise ApiError("Vārds un uzvārds ir obligāti jāieraksta.")

            if existing:
                password_hash = item.get("passwordHash") or existing["password_hash"]
                created_at = item.get("createdAt") or existing["created_at"]
            else:
                raw_password = item.get("password")
                if raw_password:
                    validate_password_policy(raw_password)
                    password_hash = hash_password(raw_password)
                else:
                    password_hash = item.get("passwordHash")
                if not password_hash:
                    raise ApiError("Jaunam lietotājam nepieciešama parole.")
                created_at = item.get("createdAt") or now_iso()

            is_driver = bool(item.get("isDriver"))
            is_station_manager = bool(item.get("isStationManager"))
            if is_station_manager and not is_driver and not (existing and existing["is_driver"]):
                raise ApiError("Par autoostas vadītāju var kļūt tikai autobusa vadītājs.")

            conn.execute(
                """
                INSERT INTO users (
                    username, first_name, last_name, age, password_hash, balance,
                    is_driver, is_station_manager, driver_since, station_manager_since,
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(username) DO UPDATE SET
                    first_name = excluded.first_name,
                    last_name = excluded.last_name,
                    age = excluded.age,
                    password_hash = excluded.password_hash,
                    balance = excluded.balance,
                    is_driver = excluded.is_driver,
                    is_station_manager = excluded.is_station_manager,
                    driver_since = excluded.driver_since,
                    station_manager_since = excluded.station_manager_since,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at
                """,
                (
                    username,
                    first_name,
                    last_name,
                    int(item.get("age") or 0),
                    password_hash,
                    float(item.get("balance") or 0),
                    bool_to_int(is_driver),
                    bool_to_int(is_station_manager),
                    item.get("driverSince"),
                    item.get("stationManagerSince"),
                    created_at,
                    item.get("updatedAt") or now_iso(),
                ),
            )
            conn.commit()
            return get_one("users", username)

        if store_name == "driverApplications":
            username = str(item.get("username") or "").strip()
            user = find_user_row(conn, username)
            if not user:
                raise ApiError("Lietotājs nav atrasts.", 404)
            if int(user["age"]) - int(item.get("experienceYears") or 0) < 18:
                raise ApiError("Tas nav iespējams, jo vadītāja tiesības var būt tikai no 18 gadu vecuma.")
            conn.execute(
                """
                INSERT OR REPLACE INTO driver_applications (
                    id, username, first_name, last_name, license_number,
                    experience_years, motivation, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    username,
                    item.get("firstName", ""),
                    item.get("lastName", ""),
                    item.get("licenseNumber", ""),
                    int(item.get("experienceYears") or 0),
                    item.get("motivation", ""),
                    item.get("createdAt"),
                ),
            )
            conn.commit()
            return get_one("driverApplications", item["id"])

        if store_name == "routes":
            if not str(item.get("name") or "").strip():
                raise ApiError("Aizpildi maršruta nosaukumu.")
            if not str(item.get("start") or "").strip() or not str(item.get("end") or "").strip():
                raise ApiError("Aizpildi maršruta sākumu un galapunktu.")
            if float(item.get("price") or 0) <= 0:
                raise ApiError("Cenai jābūt lielākai par 0 EUR.")
            driver = find_user_row(conn, item.get("driverUsername", "sistema"))
            if not driver or not bool(driver["is_driver"]):
                raise ApiError("Maršrutu var saglabāt tikai autobusa vadītājs.")
            schedules = item.get("schedules") or []
            if not schedules:
                raise ApiError("Pievieno vismaz vienu reisa laiku.")
            if any(not schedule.get("departure") or not schedule.get("arrival") for schedule in schedules):
                raise ApiError("Katram reisa laikam vajag izbraukšanu un ierašanos.")

            recurrence = item.get("recurrence") or {}
            conn.execute(
                """
                INSERT INTO routes (
                    id, name, start_point, end_point, price, driver_username,
                    departure, arrival, schedule_mode, recurrence_start_time,
                    recurrence_end_time, recurrence_interval_minutes,
                    recurrence_duration_minutes, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    start_point = excluded.start_point,
                    end_point = excluded.end_point,
                    price = excluded.price,
                    driver_username = excluded.driver_username,
                    departure = excluded.departure,
                    arrival = excluded.arrival,
                    schedule_mode = excluded.schedule_mode,
                    recurrence_start_time = excluded.recurrence_start_time,
                    recurrence_end_time = excluded.recurrence_end_time,
                    recurrence_interval_minutes = excluded.recurrence_interval_minutes,
                    recurrence_duration_minutes = excluded.recurrence_duration_minutes,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at
                """,
                (
                    item["id"],
                    item.get("name", ""),
                    item.get("start", ""),
                    item.get("end", ""),
                    float(item.get("price") or 0),
                    item.get("driverUsername", "sistema"),
                    item.get("departure"),
                    item.get("arrival"),
                    item.get("scheduleMode"),
                    recurrence.get("startTime"),
                    recurrence.get("endTime"),
                    recurrence.get("intervalMinutes"),
                    recurrence.get("durationMinutes"),
                    item.get("createdAt"),
                    item.get("updatedAt"),
                ),
            )
            conn.execute("DELETE FROM route_stops WHERE route_id = ?", (item["id"],))
            for index, stop_name in enumerate(item.get("stops") or []):
                stop_name = str(stop_name or "").strip()
                if not stop_name:
                    continue
                conn.execute(
                    "INSERT INTO route_stops (id, route_id, stop_name, sequence_number) VALUES (?, ?, ?, ?)",
                    (f"{item['id']}-stop-{index}", item["id"], stop_name, index),
                )
            conn.execute("DELETE FROM route_schedules WHERE route_id = ?", (item["id"],))
            for index, schedule in enumerate(schedules):
                schedule_id = f"{item['id']}-time-{index}"
                conn.execute(
                    """
                    INSERT INTO route_schedules (id, route_id, departure, arrival, sequence_number)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        schedule_id,
                        item["id"],
                        schedule.get("departure"),
                        schedule.get("arrival"),
                        index,
                    ),
                )
            conn.commit()
            return get_one("routes", item["id"])

        if store_name == "purchases":
            user = find_user_row(conn, item.get("username"))
            route = conn.execute("SELECT * FROM routes WHERE id = ?", (item.get("routeId", ""),)).fetchone()
            if not user:
                raise ApiError("Lietotājs nav atrasts.", 404)
            if not route:
                raise ApiError("Maršruts nav atrasts.", 404)
            conn.execute(
                """
                INSERT OR REPLACE INTO purchases (
                    id, ticket_number, username, first_name, last_name,
                    route_id, route_name, start_point, end_point, departure,
                    arrival, schedule_id, price, paid, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    item.get("ticketNumber", ""),
                    item["username"],
                    item.get("firstName", ""),
                    item.get("lastName", ""),
                    item.get("routeId", ""),
                    item.get("routeName", ""),
                    item.get("start", ""),
                    item.get("end", ""),
                    item.get("departure"),
                    item.get("arrival"),
                    item.get("scheduleId"),
                    float(item.get("price") or 0),
                    bool_to_int(item.get("paid", True)),
                    item.get("createdAt"),
                ),
            )
            conn.commit()
            return get_one("purchases", item["id"])

        if store_name == "topUps":
            amount = float(item.get("amount") or 0)
            if amount <= 0 or amount > 200:
                raise ApiError("Summa nav atbilstoša. Ievadi vairāk par 0 EUR un ne vairāk par 200 EUR.")
            conn.execute(
                """
                INSERT OR REPLACE INTO top_ups (
                    id, username, first_name, last_name, amount, balance_after, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    item["username"],
                    item.get("firstName", ""),
                    item.get("lastName", ""),
                    float(item.get("amount") or 0),
                    float(item.get("balanceAfter") or 0),
                    item.get("createdAt"),
                ),
            )
            conn.commit()
            return get_one("topUps", item["id"])

    raise ValueError("Unknown store")


class AutoostaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def api_parts(self):
        path = urllib.parse.urlparse(self.path).path
        return [urllib.parse.unquote(part) for part in path.split("/") if part]

    def do_GET(self):
        parts = self.api_parts()
        if parts[:1] == ["api"]:
            self.handle_api_get(parts)
            return
        if self.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        self.handle_post()

    def do_PUT(self):
        self.handle_write()

    def handle_api_get(self, parts):
        try:
            if parts == ["api", "health"]:
                self.send_json({"ok": True, "database": str(DB_PATH.name)})
                return
            if len(parts) == 3 and parts[1] == "store" and parts[2] in STORE_NAMES:
                self.send_json(get_all(parts[2]))
                return
            if len(parts) == 4 and parts[1] == "store" and parts[2] in STORE_NAMES:
                self.send_json(get_one(parts[2], parts[3]))
                return
            self.send_json({"error": "Unknown API endpoint"}, 404)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def handle_post(self):
        parts = self.api_parts()
        try:
            if parts == ["api", "register"]:
                self.send_json(register_user(self.read_json()), 201)
                return
            if parts == ["api", "login"]:
                self.send_json(login_user(self.read_json()))
                return
            if parts == ["api", "top-up"]:
                self.send_json(top_up_user(self.read_json()), 201)
                return
            if parts == ["api", "purchase"]:
                self.send_json(purchase_ticket(self.read_json()), 201)
                return
            if parts == ["api", "apply-driver"]:
                self.send_json(apply_driver(self.read_json()), 201)
                return
            if parts == ["api", "become-station-manager"]:
                self.send_json(become_station_manager(self.read_json()))
                return
            self.handle_write()
        except ApiError as exc:
            self.send_json({"error": str(exc)}, exc.status)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def handle_write(self):
        parts = self.api_parts()
        try:
            if len(parts) == 3 and parts[:2] == ["api", "store"] and parts[2] in STORE_NAMES:
                self.send_json(put_item(parts[2], self.read_json()))
                return
            self.send_json({"error": "Unknown API endpoint"}, 404)
        except ApiError as exc:
            self.send_json({"error": str(exc)}, exc.status)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    init_database()
    server = ThreadingHTTPServer(("127.0.0.1", port), AutoostaHandler)
    print(f"Autoostas serveris darbojas: http://127.0.0.1:{port}")
    print(f"SQLite datu baze: {DB_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
