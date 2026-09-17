# backend/services/class_manager.py
import datetime
from sqlalchemy.orm import Session
import models

def get_or_generate_classes(db: Session, target_date: datetime.date):
    # 1. Check if it's a holiday (from our DB cache)
    holiday = db.query(models.Holiday).filter(models.Holiday.date == target_date).first()
    if holiday:
        return [] # No classes to return if it's a holiday

    # 2. Get the weekday (0=Mon, 6=Sun)
    weekday = target_date.weekday()

    # 3. Fetch what the timetable says SHOULD happen today
    slots = db.query(models.TimetableSlot).filter(models.TimetableSlot.weekday == weekday).all()

    instances = []
    for slot in slots:
        # 4. Check if we already generated an instance for this slot on this date
        instance = db.query(models.ClassInstance).filter(
            models.ClassInstance.timetable_slot_id == slot.id,
            models.ClassInstance.date == target_date
        ).first()

        # 5. If not, generate and save it
        if not instance:
            instance = models.ClassInstance(
                subject_id=slot.subject_id,
                timetable_slot_id=slot.id,
                date=target_date,
                status="unmarked"
            )
            db.add(instance)
            db.commit()
            db.refresh(instance)

        instances.append(instance)

    return instances