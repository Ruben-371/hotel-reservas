from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.payment import Payment

router = APIRouter()

@router.post("/", status_code=201)
def process_payment(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    payment = Payment(
        booking_id=data["booking_id"],
        user_id=current_user["user_id"],
        amount=data["amount"],
        method=data.get("method", "card"),
        status="completed",
        created_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "booking_id": payment.booking_id, "amount": payment.amount, "status": payment.status}

@router.get("/my")
def get_my_payments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    payments = db.query(Payment).filter(Payment.user_id == current_user["user_id"]).all()
    return [{"id": p.id, "booking_id": p.booking_id, "amount": p.amount, "method": p.method, "status": p.status} for p in payments]
