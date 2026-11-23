import sqlite3

from fastapi import APIRouter, Depends

from ..schema import AuditLogOut
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/audit-logs", tags=["audit logs"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    rows = connection.execute(
        "SELECT * FROM audit_logs ORDER BY created_at DESC"
    ).fetchall()
    return [AuditLogOut(**dict(row)) for row in rows]
