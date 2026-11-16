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
    ("Annual Leave", "AL", "#EDE7F9"),
    ("Sick leave", "SL", "#FBE9E9"),
    ("Working Away From Office", "OOO", "#E8EFFC"),
    ("Bank Holiday", "BH", "#FDF2DD"),
    ("Toil", "T", "#E9F9E7"),
    ("Study Day", "S", "#F9F3E7"),
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
        category_ids_by_values = {}
        for name, code, colour in SET_CATEGORIES:
             existing = connection.execute(
                 "SELECT id FROM categories WHERE code = ?", (code,)
             ).fetchone()
             if existing:
                 category_id = existing["id"]
                 connection.execute(
                     "UPDATE categories SET name = ?, colour = ? WHERE id = ?",
                     (name, colour, category_id),
                 )
             else:
                 category_id = str(uuid.uuid4())
                 connection.execute(
                     "INSERT INTO categories (id, name, code, colour) VALUES (?,?,?,?)",
                     (category_id, name, code, colour)
                 )
             category_ids_by_values[frozenset((name, code, colour))] = category_id

        for row in connection.execute(
            "SELECT id, name, code, colour FROM categories"
        ).fetchall():
            row_values = {row["name"], row["code"], row["colour"]}
            for name, code, colour in SET_CATEGORIES:
                seed_values = {name, code, colour}
                canonical_id = category_ids_by_values[frozenset(seed_values)]
                if row["code"] != code and len(row_values & seed_values) >= 2:
                    connection.execute(
                        "UPDATE availability SET category_id = ? WHERE category_id = ?",
                        (canonical_id, row["id"]),
                    )
                    connection.execute(
                        "DELETE FROM categories WHERE id = ?", (row["id"],)
                    )
                    break
        connection.commit()
    finally:
        connection.close()