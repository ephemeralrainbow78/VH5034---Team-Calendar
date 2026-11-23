import sqlite3
import uuid

<<<<<<< HEAD

def record_audit(
    connection: sqlite3.Connection,
    user_id: str | None,
    action: str,
    entity_type: str,
) -> None:
    connection.execute(
        "INSERT INTO audit_logs (id, user_id, action, entity_type) VALUES (?, ?, ?, ?)",
        (str(uuid.uuid4()), user_id, action, entity_type),
    )
=======
def record_audit(connection: sqlite3.Connection, user_id: str | None, action: str, entity_type: str) -> None:
    connection.execute(
        "INSERT INTO audit_logs (id, user_id, action, entity_type) VALUES (?,?,?,?)",
        (str(uuid.uuid4()), user_id, action, entity_type)
    )
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
