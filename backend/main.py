# backend/main.py
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import subjects, timetable, classes, stats, holidays

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weighted Attendance Tracker API")

# Comma-separated origins, e.g. "https://my-app.vercel.app,http://localhost:5173".
# Defaults to local Vite dev so `ALLOWED_ORIGINS` only needs setting in production.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routers here
app.include_router(subjects.router)
app.include_router(timetable.router)
app.include_router(classes.router)
app.include_router(stats.router)
app.include_router(holidays.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}