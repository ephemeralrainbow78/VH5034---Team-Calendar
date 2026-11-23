import sqlite3
import uuid

<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..schema import LoginRequest, SignUpRequest, UserOut, tokenResponse
from ..security import create_access_token, hashed_password, verify_password
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/auth", tags=["auth"])
ALLOWED_ROLES = {"admin", "manager", "user"}


def _user_out(row: sqlite3.Row) -> UserOut:
    return UserOut(
        id=row["id"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        username=row["username"],
        team_id=row["team_id"],
        team=row["team_name"],
        role=row["role"],
        is_active=bool(row["is_active"]),
    )


def _fetch_user_and_team(
    connection: sqlite3.Connection, user_id: str
) -> sqlite3.Row | None:
=======
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
        role= row["role"],
        is_active = bool(row["is_Active"])
    )

def _fetch_user_and_team(connection: sqlite3.Connection, user_id: str) -> sqlite3.Row:
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    return connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.id = ?
<<<<<<< HEAD
        """,
        (user_id,),
    ).fetchone()


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignUpRequest,
    connection: sqlite3.Connection = Depends(get_database),
):
    role = payload.role.strip()
    if role.casefold() not in ALLOWED_ROLES:
        raise HTTPException(status_code=422, detail="Invalid account role.")

    username = payload.username.strip()
    existing = connection.execute(
        "SELECT id FROM users WHERE username = ? COLLATE NOCASE", (username,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="Username is already in use.")

    team_name = payload.team.strip()
    team_row = connection.execute(
        "SELECT id, name FROM team WHERE name = ? COLLATE NOCASE", (team_name,)
    ).fetchone()
    if team_row is None:
        team_id = str(uuid.uuid4())
        connection.execute(
            "INSERT INTO team (id, name) VALUES (?, ?)", (team_id, team_name)
        )
=======
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
        "SELECT id, name FROM team WHERE name = ? COLLATE NOCASE", (team_name,),
    ).fetchone()

    if team_row is None:
        team_id = str(uuid.uuid4())
        connection.execute("INSERT INTO team (id, name) VALUES (?,?)", (team_id, team_name))
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    else:
        team_id = team_row["id"]

    user_id = str(uuid.uuid4())
    connection.execute(
        """
<<<<<<< HEAD
        INSERT INTO users
            (id, first_name, last_name, username, password, team_id, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
=======
        INSERT INTO users (id, first_name, last_name, username, password, team_id, role, is_active)
        VALUES (?,?,?,?,?,?,?, ?)
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
        """,
        (
            user_id,
            payload.first_name.strip(),
            payload.last_name.strip(),
<<<<<<< HEAD
            username,
            hashed_password(payload.password),
            team_id,
            role.title(),
        ),
    )
    record_audit(connection, user_id, "signup", "User")
    connection.commit()

    row = _fetch_user_and_team(connection, user_id)
    if row is None:
        raise HTTPException(status_code=500, detail="Could not load the created account.")
    return _user_out(row)


@router.post("/login", response_model=tokenResponse)
def login(
    payload: LoginRequest,
    connection: sqlite3.Connection = Depends(get_database),
):
=======
            payload.username.strip(),
            hashed_password(payload.password),
            team_id,
            payload.role,
            1
        ),
    )

    connection.commit()

    row = _fetch_user_and_team(connection, user_id)

    return _user_out(row, row["team_name"])

@router.post("/login", response_model=tokenResponse)
def login(payload: LoginRequest, connection: sqlite3.Connection = Depends(get_connection)):
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    row = connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.username = ? COLLATE NOCASE
        """,
        (payload.username.strip(),),
    ).fetchone()
<<<<<<< HEAD
    if row is None or not row["is_active"] or not verify_password(
        payload.password, row["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )
=======

    invalid = HTTPException(status_code=401, detail="Invalid username or password.")

    if row is None or not row ["is_Active"]:
        raise invalid
    if not verify_password(payload.password, row["password"]):
        raise invalid
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

    token = create_access_token(row["id"], row["username"])
    record_audit(connection, row["id"], "login", "User")
    connection.commit()
<<<<<<< HEAD
    return tokenResponse(token=token, user=_user_out(row))

=======

    return tokenResponse(token=token, user=_user_out(row, row["team_name"]))
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

@router.get("/account", response_model=UserOut)
def account(
    current_user: sqlite3.Row = Depends(get_current_user),
<<<<<<< HEAD
    connection: sqlite3.Connection = Depends(get_database),
):
    row = _fetch_user_and_team(connection, current_user["id"])
    if row is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return _user_out(row)
=======
    connection: sqlite3.Connection = Depends(get_connection),
):
    row = _fetch_user_and_team(connection, current_user["id"])
    return _user_out(row, row["team_name"])
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
