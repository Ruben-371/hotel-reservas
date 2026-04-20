from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String, default="card")
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)
