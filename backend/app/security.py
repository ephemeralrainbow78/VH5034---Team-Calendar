import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

SECRET = os.environ.get("SECRET")
ALGORITHM = os.environ.get("ALGORITHM")

# Token expiry in minutes. Defaults to 30 minutes if value is not set as an environment variable.
TOKEN_EXPIRY = int(os.environ.get("TOKEN_EXPIRY", "30"))

# Password hashing and verification
def hashed_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, passsword_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), passsword_hash.encode("utf-8"))

# JWT token creation and decoding
def create_access_token(user_id: str, username: str) -> str:
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