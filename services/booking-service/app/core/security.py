import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SECRET_KEY", "hotel-secret-2024")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role", "client")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalido")
        return {"user_id": int(user_id), "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado")
