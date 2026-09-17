# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    target_pct = Column(Float, default=75.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    weekday = Column(Integer) # 0=Mon, 6=Sun
    slot_order = Column(Integer)
    start_time = Column(String, nullable=True)

class ClassInstance(Base):
    __tablename__ = "class_instances"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    timetable_slot_id = Column(Integer, ForeignKey("timetable_slots.id"))
    date = Column(Date, nullable=False)
    status = Column(String, default="unmarked") # unmarked, present, absent, cancelled
    
    __table_args__ = (UniqueConstraint('timetable_slot_id', 'date', name='_slot_date_uc'),)

class Holiday(Base):
    __tablename__ = "holidays"
    date = Column(Date, primary_key=True)
    name = Column(String)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())