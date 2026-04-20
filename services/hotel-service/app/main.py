from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import hotels

app = FastAPI(title="Hotel Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(hotels.router, prefix="/hotels", tags=["Hotels"])

@app.get("/health")
def health():
    return {"status": "healthy", "service": "hotel-service"}
