import sqlite3
import uuid

def record_audit(connection: sqlite3.Connection, user_id: str | None, action: str, entity_type: str) -> None:
    connection.execute(
        "INSERT INTO audit_logs (id, user_id, action, entity_type) VALUES (?,?,?,?)",
        (str(uuid.uuid4()), user_id, action, entity_type)
    )
