# backend/routers/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/overall")
def get_overall_stats(db: Session = Depends(get_db)):
    present = db.query(models.ClassInstance).filter(models.ClassInstance.status == 'present').count()
    absent = db.query(models.ClassInstance).filter(models.ClassInstance.status == 'absent').count()

    # Note: cancelled and unmarked classes are completely excluded from the denominator
    total = present + absent
    pct = (present / total * 100) if total > 0 else 0.0

    return {
        "present": present,
        "absent": absent,
        "total_marked": total,
        "percentage": round(pct, 2)
    }

@router.get("/subjects")
def get_subject_stats(db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).all()
    stats = []

    for sub in subjects:
        present = db.query(models.ClassInstance).filter(
            models.ClassInstance.subject_id == sub.id,
            models.ClassInstance.status == 'present'
        ).count()
        absent = db.query(models.ClassInstance).filter(
            models.ClassInstance.subject_id == sub.id,
            models.ClassInstance.status == 'absent'
        ).count()

        total = present + absent
        pct = (present / total * 100) if total > 0 else 0.0

        stats.append({
            "subject_id": sub.id,
            "subject_name": sub.name,
            "present": present,
            "absent": absent,
            "total_marked": total,
            "percentage": round(pct, 2),
            "target_pct": sub.target_pct
        })

    return stats