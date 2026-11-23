import sqlite3
<<<<<<< HEAD
from collections.abc import Iterator
=======
from typing import Iterator
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import get_connection
from .security import decode_access_token

bearer_schema = HTTPBearer(auto_error=False)

<<<<<<< HEAD

=======
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
def get_database() -> Iterator[sqlite3.Connection]:
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()

<<<<<<< HEAD

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_schema),
    connection: sqlite3.Connection = Depends(get_database),
) -> sqlite3.Row:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

=======
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_schema),
    connection: sqlite3.Connection = Depends(get_database)
) -> sqlite3.Row:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthroized"
    )

    if credentials is None or credentials.scheme != "Bearer":
        raise unauthorized
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise unauthorized

    user = connection.execute(
<<<<<<< HEAD
        "SELECT * FROM users WHERE id = ? AND is_active = 1",
        (payload.get("sub"),),
    ).fetchone()
    if user is None:
        raise unauthorized
    return user
=======
        "SELECT FROM users WHERE id = ? AND is_Active = 1", (payload.get("sub"),)
    ).fetchone()

    if user is None:
        raise unauthorized

    return user

>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
