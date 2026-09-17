# backend/routers/holidays.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
from services.holiday_sync import fetch_and_sync_holidays

router = APIRouter(prefix="/holidays", tags=["Holidays"])

@router.post("/sync")
def sync_holidays(
    year: int = Query(2026, description="Year to fetch holidays for"),
    country_code: str = Query("US", description="2-letter ISO country code e.g. US, IN, GB"),
    db: Session = Depends(get_db)
):
    return fetch_and_sync_holidays(db, year, country_code)

@router.get("/")
def list_holidays(db: Session = Depends(get_db)):
    return db.query(models.Holiday).order_by(models.Holiday.date).all()