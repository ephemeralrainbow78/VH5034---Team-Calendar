import sqlite3
from typing import Iterator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import get_database_connection
from .security import decode_access_token

bearer_schema = HTTPBearer(auto_error=False)

def get_database() -> Iterator[sqlite3.Connection]:
    connection = get_database_connection()
    try:
        yield connection
    finally:
        connection.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_schema),
    connection: sqlite3.Connection = Depends(get_database)
) -> sqlite3.Row:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthroized"
    )

    if credentials is None or credentials.scheme != "Bearer":
        raise unauthorized
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise unauthorized

    user = connection.execute(
        "SELECT FROM users WHERE id = ? AND is_Active = 1", (payload.get("sub"),)
    ).fetchone()

    if user is None:
        raise unauthorized

    return user

