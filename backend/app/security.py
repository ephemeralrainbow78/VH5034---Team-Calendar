<<<<<<< HEAD
import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt

from .database import DATA_DIR

SECRET_PATH = DATA_DIR / ".jwt_secret"


def _load_secret() -> str:
    configured_secret = os.getenv("JWT_SECRET")
    if configured_secret:
        return configured_secret

    try:
        with SECRET_PATH.open("x", encoding="utf-8") as secret_file:
            secret_file.write(secrets.token_urlsafe(48))
    except FileExistsError:
        pass

    return SECRET_PATH.read_text(encoding="utf-8").strip()


JWT_SECRET = _load_secret()
PBKDF2_ROUNDS = 310_000


def hashed_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS
    )
    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_digest = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${encoded_salt}${encoded_digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("ascii"))
        except (ValueError, TypeError):
            return False

    try:
        scheme, rounds_text, salt_text, digest_text = stored_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        rounds = int(rounds_text)
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected_digest = base64.urlsafe_b64decode(digest_text.encode("ascii"))
    except (ValueError, TypeError):
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, rounds
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def create_access_token(user_id: str, username: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
    return jwt.encode(
        {"sub": user_id, "username": username, "exp": expires_at},
        JWT_SECRET,
        algorithm="HS256",
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
=======
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
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
