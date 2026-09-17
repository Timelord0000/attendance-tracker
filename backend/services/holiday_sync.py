# backend/services/holiday_sync.py
import json
import urllib.request
from datetime import datetime
from sqlalchemy.orm import Session
import models

def fetch_and_sync_holidays(db: Session, year: int = 2026, country_code: str = "US"):
    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/{country_code}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FastAPI-Attendance-Tracker"})
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                return {"error": f"Failed to fetch holidays (HTTP {response.status})"}

            data = json.loads(response.read().decode("utf-8"))
            synced_count = 0
            # The API can return several entries for the same date (e.g. multiple
            # regional observances). The session does not autoflush, so pending
            # rows are invisible to the query below -- track this batch's dates
            # to avoid duplicate INSERTs and a UNIQUE constraint failure.
            seen_dates = set()

            for item in data:
                holiday_date = datetime.strptime(item["date"], "%Y-%m-%d").date()
                if holiday_date in seen_dates:
                    continue
                seen_dates.add(holiday_date)
                holiday_name = item.get("name") or item.get("localName", "Public Holiday")

                existing = db.query(models.Holiday).filter(models.Holiday.date == holiday_date).first()
                if not existing:
                    new_holiday = models.Holiday(date=holiday_date, name=holiday_name)
                    db.add(new_holiday)
                    synced_count += 1
                else:
                    existing.name = holiday_name

            db.commit()
            return {
                "status": "success",
                "synced_new": synced_count,
                "total_holidays": len(data),
                "year": year,
                "country_code": country_code
            }
    except Exception as e:
        # Log the full error server-side; return a generic message so DB
        # internals (SQL, parameters) never leak to API clients.
        print(f"[holiday_sync] failed: {e}")
        return {"error": "Holiday sync failed. Check your connection and try again."}