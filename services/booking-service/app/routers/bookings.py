from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.booking import Booking

router = APIRouter()

@router.post("/", status_code=201)
def create_booking(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    booking = Booking(
        user_id=current_user["user_id"],
        hotel_id=data["hotel_id"],
        hotel_name=data.get("hotel_name", ""),
        hotel_image=data.get("hotel_image", ""),
        check_in=data["check_in"],
        check_out=data["check_out"],
        guests=data.get("guests", 1),
        total_price=data.get("total_price", 0),
        special_requests=data.get("special_requests"),
        status="confirmed",
        created_at=datetime.utcnow()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {
        "id": booking.id, "user_id": booking.user_id,
        "hotel_id": booking.hotel_id, "hotel_name": booking.hotel_name,
        "hotel_image": booking.hotel_image, "check_in": booking.check_in,
        "check_out": booking.check_out, "guests": booking.guests,
        "total_price": booking.total_price, "status": booking.status,
        "special_requests": booking.special_requests,
        "created_at": booking.created_at.isoformat()
    }

def booking_to_dict(b):
    return {
        "id": b.id, "user_id": b.user_id,
        "hotel_id": b.hotel_id, "hotel_name": b.hotel_name,
        "hotel_image": b.hotel_image, "check_in": b.check_in,
        "check_out": b.check_out, "guests": b.guests,
        "total_price": b.total_price, "status": b.status,
        "special_requests": b.special_requests,
        "created_at": b.created_at.isoformat() if b.created_at else None
    }

@router.get("/my")
def get_my_bookings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    bookings = db.query(Booking).filter(Booking.user_id == current_user["user_id"]).all()
    return [booking_to_dict(b) for b in bookings]

@router.get("/")
def get_all_bookings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    bookings = db.query(Booking).all()
    return [booking_to_dict(b) for b in bookings]

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if booking.user_id != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Sin permiso")
    booking.status = "cancelled"
    db.commit()
    return booking_to_dict(booking)
