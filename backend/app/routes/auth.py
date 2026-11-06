import sqlite3
import uuid

from fastapi import APIRouter, HTTPException, Depends, status

from ..audit import record_audit
from ..user_dependents import get_connection, get_current_user
from ..schema import LoginRequest, SignUpRequest, tokenResponse, UserOut
from ..security import create_access_token, verify_password, hashed_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _user_out(row: sqlite3.Row, team_name: str | None) -> UserOut:
    return UserOut(
        id = row["id"],
        first_name = row["first_name"],
        last_name = row["last_name"],
        username = row["username"],
        team_id = row["team_id"],
        team = team_name,
        is_active = bool(row["is_Active"])
    )

def _fetch_user_and_team(connection: sqlite3.Connection, user_id: str) -> sqlite3.Row:
    return connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.id = ?
        """, (user_id,),
    ).fetchone()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest, connection: sqlite3.Connection = Depends(get_connection)):
    existing = connection.execute(
        "SELECT id FROM  users WHERE username = ? COLLATE NOCASE", (payload.username.strip(),)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this username already exisits.")

    team_name = payload.team.strip()
    team_row = connection.execute(
        "SELECT id, name FROM team WHERE name ? COLLATE NOCASE", (team_name,),
    ).fetchone()

    if team_row is None:
        team_id = str(uuid.uuid4())
        connection.execute("INSERT INTO team (id, name) VALUES (?,?)", (team_id, team_name))
    else:
        team_id = team_row["id"]

    user_id = str(uuid.uuid4())
    connection.execute(
        """
        INSERT INTO users (id, first_name, last_name, username, password, team_id, is_active)
        VALUES (?,?,?,?,?,?,?)
        """,
        (
            user_id,
            payload.first_name.strip(),
            payload.last_name.strip(),
            payload.username.strip(),
            hashed_password(payload.password),
            team_id
        ),
    )

    row = _fetch_user_and_team(connection, user_id)
    return _user_out(row, row["team_name"])

@router.post("/login", response_model=tokenResponse)
def login(payload: LoginRequest, connection: sqlite3.Connection = Depends(get_connection)):
    row = connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.username = ? COLLATE NOCASE
        """,
        (payload.username.strip(),),
    ).fetchone()

    invalid = HTTPException(status_code=401, detail="Invalid username or password.")

    if row is None or not row ["is_Active"]:
        raise invalid
    if not verify_password(payload.password, row["password"]):
        raise invalid

    token = create_access_token(row["id"], row["username"])
    record_audit(connection, row["id"], "login", "User")
    connection.commit()

    return tokenResponse(token=token, user=_user_out(row, row["team_name"]))

@router.get("/account", response_model=UserOut)
def account(
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_connection),
):
    row = _fetch_user_and_team(connection, current_user["id"])
    return _user_out(row, row["team_name"])