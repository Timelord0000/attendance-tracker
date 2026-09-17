# backend/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from datetime import date

# --- Subject Schemas ---
class SubjectBase(BaseModel):
    name: str
    code: Optional[str] = None
    target_pct: Optional[float] = 75.0

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    target_pct: Optional[float] = None

class Subject(SubjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Timetable Schemas ---
class TimetableSlotBase(BaseModel):
    subject_id: int
    weekday: int       # 0=Mon, 6=Sun
    slot_order: int
    start_time: Optional[str] = None

class TimetableSlotCreate(TimetableSlotBase):
    pass

class TimetableSlot(TimetableSlotBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Class Instance Schemas ---
class ClassInstanceBase(BaseModel):
    date: date
    status: str

class ClassInstanceUpdate(BaseModel):
    status: str # 'unmarked', 'present', 'absent', 'cancelled'

class ClassInstanceResponse(ClassInstanceBase):
    id: int
    subject_id: int
    timetable_slot_id: int

    model_config = ConfigDict(from_attributes=True)
