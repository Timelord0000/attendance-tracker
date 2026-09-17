# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import subjects, timetable, classes, stats, holidays

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weighted Attendance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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