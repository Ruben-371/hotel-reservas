from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "client"

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
