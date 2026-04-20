from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    hotel_id = Column(String, nullable=False)
    hotel_name = Column(String, nullable=False)
    hotel_image = Column(String, nullable=True)
    check_in = Column(String, nullable=False)
    check_out = Column(String, nullable=False)
    guests = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    special_requests = Column(String, nullable=True)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)
