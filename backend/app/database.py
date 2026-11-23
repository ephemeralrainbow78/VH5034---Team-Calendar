import sqlite3
import uuid
from pathlib import Path

from .bank_holidays import ensure_bank_holidays_for_all_users

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "app.sqlite"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

SET_TEAMS = ("Software", "Infrastructure", "Delivery", "Marketing")
SET_CATEGORIES = (
    ("Annual Leave", "AL", "#EDE7F9"),
    ("Sick leave", "SL", "#FBE9E9"),
    ("Working Away From Office", "OOO", "#E8EFFC"),
    ("Bank Holiday", "BH", "#FDF2DD"),
    ("Toil", "T", "#E9F9E7"),
    ("Study Day", "S", "#F9F3E7"),
)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database() -> None:
    connection = get_connection()
    try:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        user_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(users)")
        }
        if "role" not in user_columns:
            connection.execute(
                "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'User'"
            )

        for team_name in SET_TEAMS:
            connection.execute(
                "INSERT OR IGNORE INTO team (id, name) VALUES (?, ?)",
                (str(uuid.uuid4()), team_name),
            )

        for name, code, colour in SET_CATEGORIES:
            connection.execute(
                """
                INSERT OR IGNORE INTO categories (id, name, code, colour)
                VALUES (?, ?, ?, ?)
                """,
                (str(uuid.uuid4()), name, code, colour),
            )

        ensure_bank_holidays_for_all_users(connection)
        connection.commit()
    finally:
        connection.close()
