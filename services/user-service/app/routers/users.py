from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_all_users(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "full_name": u.full_name, "email": u.email, "phone": u.phone, "role": u.role, "is_active": u.is_active} for u in users]
