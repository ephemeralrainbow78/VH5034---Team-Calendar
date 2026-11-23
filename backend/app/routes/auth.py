import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..schema import (
    LoginRequest,
    MessageOut,
    PasswordChangeRequest,
    SignUpRequest,
    UserOut,
    tokenResponse,
)
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
    return connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.id = ?
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
        raise HTTPException(
            status_code=422,
            detail="Select an existing team.",
        )
    team_id = team_row["id"]

    user_id = str(uuid.uuid4())
    connection.execute(
        """
        INSERT INTO users
            (id, first_name, last_name, username, password, team_id, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """,
        (
            user_id,
            payload.first_name.strip(),
            payload.last_name.strip(),
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
    row = connection.execute(
        """
        SELECT users.*, team.name AS team_name
        FROM users
        LEFT JOIN team ON team.id = users.team_id
        WHERE users.username = ? COLLATE NOCASE
        """,
        (payload.username.strip(),),
    ).fetchone()
    if row is None or not row["is_active"] or not verify_password(
        payload.password, row["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token = create_access_token(row["id"], row["username"])
    record_audit(connection, row["id"], "login", "User")
    connection.commit()
    return tokenResponse(token=token, user=_user_out(row))


@router.get("/account", response_model=UserOut)
def account(
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    row = _fetch_user_and_team(connection, current_user["id"])
    if row is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return _user_out(row)


@router.patch("/account/password", response_model=MessageOut)
def change_password(
    payload: PasswordChangeRequest,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    if not verify_password(payload.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if verify_password(payload.new_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be different from the current password.",
        )

    connection.execute(
        """
        UPDATE users
        SET password = ?, last_updated = datetime('now'), last_updated_by = ?
        WHERE id = ?
        """,
        (
            hashed_password(payload.new_password),
            current_user["username"],
            current_user["id"],
        ),
    )
    record_audit(connection, current_user["id"], "change password", "User")
    connection.commit()
    return {"message": "Password updated successfully."}
