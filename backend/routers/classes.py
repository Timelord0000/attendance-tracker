# backend/routers/classes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import datetime
from typing import List

from database import get_db
import models, schemas
from services.class_manager import get_or_generate_classes

router = APIRouter(prefix="/classes", tags=["Classes & Attendance"])

@router.get("/", response_model=List[schemas.ClassInstanceResponse])
def get_classes_for_date(date: datetime.date = Query(...), db: Session = Depends(get_db)):
    return get_or_generate_classes(db, date)

@router.patch("/{class_id}", response_model=schemas.ClassInstanceResponse)
def update_attendance(class_id: int, status_update: schemas.ClassInstanceUpdate, db: Session = Depends(get_db)):
    valid_statuses = ['unmarked', 'present', 'absent', 'cancelled']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    db_class = db.query(models.ClassInstance).filter(models.ClassInstance.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class instance not found")

    db_class.status = status_update.status
    db.commit()
    db.refresh(db_class)
    return db_class