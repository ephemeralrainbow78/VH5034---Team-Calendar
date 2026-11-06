import sqlite3

from fastapi import APIRouter, Depends

from ..user_dependents import get_database, get_current_user
from ..schema import AuditLogOut

router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])

@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    user_id: str | None = None,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    if user_id:
        rows = connection.execute(
            "SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    else:
        rows = connection.execute("SELECT * FROM audit_logs ORDER BY created_at DESC").fetchall()
    return [AuditLogOut(**dict(row)) for row in rows]