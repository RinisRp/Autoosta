PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  password_hash TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  is_driver INTEGER NOT NULL DEFAULT 0,
  is_station_manager INTEGER NOT NULL DEFAULT 0,
  driver_since TEXT,
  station_manager_since TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS driver_applications (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  motivation TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  price REAL NOT NULL,
  driver_username TEXT NOT NULL,
  departure TEXT,
  arrival TEXT,
  schedule_mode TEXT,
  recurrence_start_time TEXT,
  recurrence_end_time TEXT,
  recurrence_interval_minutes INTEGER,
  recurrence_duration_minutes INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (driver_username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS route_stops (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  stop_name TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS route_schedules (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  route_id TEXT NOT NULL,
  route_name TEXT NOT NULL,
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  departure TEXT,
  arrival TEXT,
  schedule_id TEXT,
  price REAL NOT NULL,
  paid INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username),
  FOREIGN KEY (route_id) REFERENCES routes(id)
);

CREATE TABLE IF NOT EXISTS top_ups (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username)
);

CREATE INDEX IF NOT EXISTS idx_routes_driver ON routes(driver_username);
CREATE INDEX IF NOT EXISTS idx_purchases_username ON purchases(username);
CREATE INDEX IF NOT EXISTS idx_purchases_route ON purchases(route_id);
CREATE INDEX IF NOT EXISTS idx_top_ups_username ON top_ups(username);
CREATE INDEX IF NOT EXISTS idx_driver_applications_username ON driver_applications(username);
