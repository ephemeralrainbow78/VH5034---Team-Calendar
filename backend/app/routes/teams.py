import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status

from ..audit import record_audit
from ..schema import TeamCreate, TeamOut, TeamUpdate
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/teams", tags=["teams"])


def _ensure_admin(current_user: sqlite3.Row) -> None:
    if current_user["role"].casefold() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage teams.",
        )


def _get_team(connection: sqlite3.Connection, team_id: str) -> sqlite3.Row:
    team = connection.execute("SELECT * FROM team WHERE id = ?", (team_id,)).fetchone()
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found.")
    return team


@router.get("", response_model=list[TeamOut])
def list_teams(connection: sqlite3.Connection = Depends(get_database)):
    rows = connection.execute(
        "SELECT * FROM team ORDER BY name COLLATE NOCASE"
    ).fetchall()
    return [TeamOut(**dict(row)) for row in rows]


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    _ensure_admin(current_user)

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Team name cannot be empty.")

    existing = connection.execute(
        "SELECT id FROM team WHERE name = ? COLLATE NOCASE", (name,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="Team already exists.")

    team_id = str(uuid.uuid4())
    connection.execute(
        "INSERT INTO team (id, name, description, created_by) VALUES (?, ?, ?, ?)",
        (team_id, name, payload.description, current_user["username"]),
    )
    record_audit(connection, current_user["id"], "create team", "Team")
    connection.commit()
    row = connection.execute("SELECT * FROM team WHERE id = ?", (team_id,)).fetchone()
    return TeamOut(**dict(row))


@router.put("/{team_id}", response_model=TeamOut)
def update_team(
    team_id: str,
    payload: TeamUpdate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    _ensure_admin(current_user)
    team = _get_team(connection, team_id)

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Team name cannot be empty.")

    duplicate = connection.execute(
        "SELECT id FROM team WHERE name = ? COLLATE NOCASE AND id != ?",
        (name, team_id),
    ).fetchone()
    if duplicate:
        raise HTTPException(status_code=409, detail="Team already exists.")

    description = payload.description.strip() if payload.description else None
    if not description:
        description = None
    connection.execute(
        """
        UPDATE team
        SET name = ?, description = ?, updated_at = datetime('now'), updated_by = ?
        WHERE id = ?
        """,
        (name, description, current_user["username"], team_id),
    )
    record_audit(
        connection,
        current_user["id"],
        f"update team {team['name']} to {name}",
        "Team",
    )
    connection.commit()
    return TeamOut(**dict(_get_team(connection, team_id)))


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: str,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
) -> Response:
    _ensure_admin(current_user)
    team = _get_team(connection, team_id)

    member_count = connection.execute(
        "SELECT COUNT(*) FROM users WHERE team_id = ?", (team_id,)
    ).fetchone()[0]
    if member_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Move all team members before deleting this team.",
        )

    absence_count = connection.execute(
        "SELECT COUNT(*) FROM availability WHERE team_id = ?", (team_id,)
    ).fetchone()[0]
    if absence_count:
        connection.execute(
            """
            UPDATE availability
            SET team_id = NULL, last_updated = datetime('now'), last_updated_by = ?
            WHERE team_id = ?
            """,
            (current_user["username"], team_id),
        )

    connection.execute("DELETE FROM team WHERE id = ?", (team_id,))
    action = f"delete team {team['name']}"
    if absence_count:
        action += f" and unassign {absence_count} existing absence record(s)"
    record_audit(connection, current_user["id"], action, "Team")
    connection.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
