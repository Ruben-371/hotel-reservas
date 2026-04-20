from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import payments

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payment Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])

@app.get("/health")
def health():
    return {"status": "healthy", "service": "payment-service"}
