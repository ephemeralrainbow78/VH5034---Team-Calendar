import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from ..schema import UserOut
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/users", tags=["users"])

USER_SELECT = """
    SELECT users.id, users.first_name, users.last_name, users.username,
           users.team_id, team.name AS team, users.role, users.is_active
    FROM users
    LEFT JOIN team ON team.id = users.team_id
"""


@router.get("", response_model=list[UserOut])
def list_users(
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    rows = connection.execute(
        USER_SELECT
        + " ORDER BY users.last_name COLLATE NOCASE, users.first_name COLLATE NOCASE"
    ).fetchall()
    return [UserOut(**dict(row)) for row in rows]


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    row = connection.execute(USER_SELECT + " WHERE users.id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserOut(**dict(row))
