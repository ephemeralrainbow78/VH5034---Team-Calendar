import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..schema import UserOut, UserTeamUpdate
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


@router.patch("/{user_id}/team", response_model=UserOut)
def move_user_to_team(
    user_id: str,
    payload: UserTeamUpdate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    if current_user["role"].casefold() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can move team members.",
        )

    user = connection.execute(
        """
        SELECT users.id, users.team_id, users.username, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.id = ? AND users.is_active = 1
        """,
        (user_id,),
    ).fetchone()
    if user is None:
        raise HTTPException(status_code=404, detail="Active user not found.")

    team = connection.execute(
        "SELECT id, name FROM team WHERE id = ?", (payload.team_id,)
    ).fetchone()
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found.")

    if user["team_id"] != payload.team_id:
        connection.execute(
            """
            UPDATE users
            SET team_id = ?, last_updated = datetime('now'), last_updated_by = ?
            WHERE id = ?
            """,
            (payload.team_id, current_user["username"], user_id),
        )
        connection.execute(
            """
            UPDATE availability
            SET team_id = ?, last_updated = datetime('now'), last_updated_by = ?
            WHERE user_id = ?
            """,
            (payload.team_id, current_user["username"], user_id),
        )
        old_team_name = user["team_name"] or "Unassigned"
        action = (
            f"move team member {user['username']} from "
            f"{old_team_name} to {team['name']}"
        )
        record_audit(connection, current_user["id"], action, "User")
        connection.commit()

    updated_user = connection.execute(
        USER_SELECT + " WHERE users.id = ?", (user_id,)
    ).fetchone()
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserOut(**dict(updated_user))
