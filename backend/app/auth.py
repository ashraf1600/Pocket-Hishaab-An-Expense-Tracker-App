from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt   # <-- Direct import
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ---------- DIRECT BCRYPT WITH TRUNCATION ----------
def _truncate_to_72_bytes(password: str) -> bytes:
    """Encode to UTF‑8 and truncate to 72 bytes (bcrypt limit)."""
    encoded = password.encode('utf-8')
    if len(encoded) > 72:
        encoded = encoded[:72]
    return encoded

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt (auto‑truncates to 72 bytes)."""
    pwd_bytes = _truncate_to_72_bytes(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash (auto‑truncates)."""
    pwd_bytes = _truncate_to_72_bytes(plain_password)
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))

# ---------- JWT TOKEN ----------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt