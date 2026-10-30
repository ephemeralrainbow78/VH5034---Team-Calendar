import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..user_dependents import get_current_user, get_database
from ..schema import TeamCreate, TeamOut

router = APIRouter(prefix="/api/teams", tags=["teams"])

@router.get("", response_module=list[TeamOut])
def list_teams(connection: sqlite3.Connection = Depends(get_database)):
    rows = connection.execute("SELECT * FROM team ORDER BY name COLLATE NOCASE").fetchall()
    return [TeamOut(**dict(row)) for row in rows]

@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    existing = connection.execute(
        "SELECT id FROM team WHERE name = ? COLLATE NOCASE", (payload.name.strip(),)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="A team with this name already exists.")

    team_id = str(uuid.uuid4())
    connection.execute(
        "INSERT INTO teams (id, name, description, created_by) VALUES (?,?,?,?)",
        (team_id, payload.name.strip(), payload.description, current_user["username"]),
    )
    record_audit(connection, current_user["id"], "create team", "Team")
    connection.commit()

    row = connection.execute("SELECT * FROM team WHERE id = ?", (team_id)).fetchone()
    return TeamOut(**dict(row))
