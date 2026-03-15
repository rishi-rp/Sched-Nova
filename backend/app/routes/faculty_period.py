from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.models.period import TimetablePeriod

from db.session import get_db
from db.models.faculty_period import FacultyPeriodAvailability
from db.models.period import Period
from db.models.timetable import Timetable
from db.models.user import User
from app.schemas.faculty_period import FacultyPeriodAvailabilityInput
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/faculty-availability",
    tags=["Faculty Availability"]
)


@router.post("/")
def save_faculty_availability(
    timetable_id: int,
    payload: list[FacultyPeriodAvailabilityInput],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()

    if not timetable:
        raise HTTPException(404, "Timetable not found")

    # 🔥 Clear old availability for timetable
    db.query(FacultyPeriodAvailability).filter(
        FacultyPeriodAvailability.timetable_id == timetable_id
    ).delete(synchronize_session=False)

    # Map (day, index) → period_id

    periods = (
        db.query(Period)
        .join(TimetablePeriod)
        .filter(
            TimetablePeriod.timetable_id == timetable_id,
            Period.user_id == current_user.id
        )
        .all()
    )


    period_map = {}
    for p in periods:
        period_map.setdefault(p.day, [])
        period_map[p.day].append(p)

    # Ensure ordering by period_number
    for day in period_map:
        period_map[day].sort(key=lambda x: x.period_number)

    rows = []

    for faculty in payload:
        for day, indexes in faculty.availability.items():
            for idx in indexes:
                try:
                    period = period_map[day][idx]
                except IndexError:
                    continue

                rows.append(
                    FacultyPeriodAvailability(
                        timetable_id=timetable_id,
                        faculty_id=faculty.faculty_id,
                        period_id=period.id,
                        is_available=True
                    )
                )

    db.bulk_save_objects(rows)
    db.commit()

    return {
        "message": "Faculty availability saved successfully",
        "rows": len(rows)
    }


@router.get("/")
def get_faculty_availability(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = (
        db.query(Timetable)
        .filter(
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )

    if not timetable:
        raise HTTPException(404, "Timetable not found")

    # -------------------------
    # Timetable periods (ordered)
    # -------------------------
    periods = (
        db.query(Period)
        .join(TimetablePeriod)
        .filter(
            TimetablePeriod.timetable_id == timetable_id,
            Period.user_id == current_user.id
        )
        .all()
    )

    period_map = {}
    for p in periods:
        period_map.setdefault(p.day, []).append(p)

    for day in period_map:
        period_map[day].sort(key=lambda x: x.period_number)

    # Build lookup: period_id → index
    period_index = {
        p.id: idx
        for day in period_map
        for idx, p in enumerate(period_map[day])
    }

    # -------------------------
    # Faculty availability rows
    # -------------------------
    rows = (
        db.query(FacultyPeriodAvailability)
        .filter(
            FacultyPeriodAvailability.timetable_id == timetable_id
        )
        .all()
    )

    result = {}

    for row in rows:
        faculty_id = row.faculty_id
        period_id = row.period_id

        period = next(
            (p for day in period_map.values() for p in day if p.id == period_id),
            None
        )
        if not period:
            continue

        result.setdefault(faculty_id, {})
        result[faculty_id].setdefault(period.day, [])
        result[faculty_id][period.day].append(period_index[period_id])

    # Sort indexes for frontend stability
    response = []
    for faculty_id, availability in result.items():
        for day in availability:
            availability[day].sort()

        response.append({
            "faculty_id": faculty_id,
            "availability": availability
        })

    return response
