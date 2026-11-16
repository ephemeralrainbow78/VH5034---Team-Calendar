import sqlite3
import uuid
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_Path = DATA_DIR / "app.sqlite"

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
SCHEMA = SCHEMA_PATH.read_text()

SET_TEAMS = ["Software", "Infrastructure", "Delivery", "Marketing"]

SET_CATEGORIES = [
    {"Annual Leave", "AL", "#EDE7F9"},
    {"Sixk leave", "SL", "#FBE9E9"},
    {"Working Away From Office", "OOO", "#E8EFFC"},
    {"Bank Holiday", "BH", "#FDF2DD"},
    {"Toil", "T", "#E9F9E7"},
    {"Study Day", "S", "#F9F3E7"},
]

def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_Path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    
    return connection

def init_database() -> None:
    connection = get_connection()
    try:
        connection.executescript(SCHEMA)

        user_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(users)")
        }
        if "role" not in user_columns:
            connection.execute(
                "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'User'"
            )

        for name in SET_TEAMS:
            existing = connection.execute(
                "SELECT id from team WHERE name = ? COLLATE NOCASE", (name,)
            ).fetchone()
            if not existing:
                connection.execute(
                    "INSERT OR IGNORE INTO team (id, name) VALUES (?,?)",
                    (str(uuid.uuid4()), name)
                )
        for name, code, colour in SET_CATEGORIES:
             existing = connection.execute(
                 "SELECT id FROM categories WHERE code = ?", (code,)
             ).fetchone()
             if not existing:
                 connection.execute(
                     "INSERT INTO categories (id, name, code, colour) VALUES (?,?,?,?)",
                     (str(uuid.uuid4()), name, code, colour)
                 )
        connection.commit()
    finally:
        connection.close()