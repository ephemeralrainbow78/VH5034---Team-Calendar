CREATE TABLE IF NOT EXISTS team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT,
    updated_by TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password TEXT NOT NULL,
    team_id TEXT REFERNCES team(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT,
    last_updated TEXT,
    last_updated_by TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE if NOT EXISTS categories(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cpde TEXT NOT NULL UNIQUE,
    color TEXT
);

CREATE TABLE IF NOT EXISTS availability(
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id)
    category_id TEXT NOT NULL REFERENCES categories(id),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    noted TEXT,
    created_by TEXT,
    last_updated TEXT,
    last_updated_by TEXT DEFAULT (datetime('now')),
    team_id TEXT REFERENCES team(id)
);

CREATE TABLE IF NOT EXISTS audit_logs(
    id TEXT PRIMARY KEY,
    user_id references users(id),
    action TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    entity_type TEXT NOT NULL
);
