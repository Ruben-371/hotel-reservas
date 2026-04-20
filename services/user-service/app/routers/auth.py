from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        phone=data.phone,
        role=data.role or "client"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}
    }

@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"id": current_user.id, "full_name": current_user.full_name, "email": current_user.email, "role": current_user.role}
