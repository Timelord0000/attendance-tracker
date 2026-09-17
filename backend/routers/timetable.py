# backend/routers/timetable.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(prefix="/timetable", tags=["Timetable"])

@router.post("/slots", response_model=schemas.TimetableSlot)
def create_slot(slot: schemas.TimetableSlotCreate, db: Session = Depends(get_db)):
    # Verify subject exists
    subject = db.query(models.Subject).filter(models.Subject.id == slot.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db_slot = models.TimetableSlot(**slot.model_dump())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.get("/", response_model=List[schemas.TimetableSlot])
def get_timetable(db: Session = Depends(get_db)):
    # Return all slots, ordered by day of week then by slot order
    return db.query(models.TimetableSlot).order_by(
        models.TimetableSlot.weekday,
        models.TimetableSlot.slot_order
    ).all()

@router.delete("/slots/{slot_id}")
def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    db_slot = db.query(models.TimetableSlot).filter(models.TimetableSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    db.delete(db_slot)
    db.commit()
    return {"message": "Slot deleted successfully"}