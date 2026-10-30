import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

SECRET = os.environ.get("SECRET")
ALGORITHM = os.environ.get("ALGORITHM")
TOKEN_EXPIRY = os.environ.get("TOKEN_EXPIRY")

def hashed_password(password: str) -> str:
    return bcrypt.hash.pw(password.encode("utf-8"), bcrypt.gensalt()).decode("uft-8")

def verify_password(password: str, passsword_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("uft-8"), passsword_hash.encode("uft-8"))

def create_access_token(user_id: st, username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "username": username,
        "iat": now,
        "exp": now + timedelta(minutes=TOKEN_EXPIRY)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=ALGORITHM)
