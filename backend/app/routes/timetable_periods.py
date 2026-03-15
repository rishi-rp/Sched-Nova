from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.period import Period
from db.models.period import TimetablePeriod
from db.models.user import User
from app.schemas.period import PeriodResponse, TimetablePeriodCreate, TimetablePeriodResponse
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/periods",
    tags=["Timetable Periods"]
)


# -------------------------
# Add Period to Timetable
# -------------------------
@router.post(
    "/",
    response_model=TimetablePeriodResponse,
    status_code=status.HTTP_201_CREATED
)
def add_period_to_timetable(
    timetable_id: int,
    data: TimetablePeriodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()
    if not timetable:
        raise HTTPException(404, "Timetable not found")

    period = db.query(Period).filter(
        Period.id == data.period_id,
        Period.user_id == current_user.id,
        Period.is_active == True
    ).first()
    if not period:
        raise HTTPException(404, "Period not found")

    existing = db.query(TimetablePeriod).filter(
        TimetablePeriod.timetable_id == timetable_id,
        TimetablePeriod.period_id == data.period_id
    ).first()
    if existing:
        raise HTTPException(400, "Period already added to timetable")

    link = TimetablePeriod(
        timetable_id=timetable_id,
        period_id=data.period_id
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return link


# -------------------------
# List Timetable Periods
# -------------------------
@router.get("/", response_model=list[PeriodResponse])
def list_timetable_periods(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Period)
        .join(TimetablePeriod, TimetablePeriod.period_id == Period.id)
        .join(Timetable)
        .filter(
            TimetablePeriod.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Period.is_active == True
        )
        .order_by(Period.day, Period.period_number)
        .all()
    )


# -------------------------
# Replace Timetable Periods
# -------------------------
@router.put("/")
def replace_timetable_periods(
    timetable_id: int,
    data: list[TimetablePeriodCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()
    if not timetable:
        raise HTTPException(404, "Timetable not found")

    # delete old
    db.query(TimetablePeriod).filter(
        TimetablePeriod.timetable_id == timetable_id
    ).delete()

    # insert new
    for item in data:
        db.add(
            TimetablePeriod(
                timetable_id=timetable_id,
                period_id=item.period_id
            )
        )

    db.commit()
    return {"status": "ok"}



# -------------------------
# Remove Period from Timetable
# -------------------------
@router.delete(
    "/{timetable_period_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_period_from_timetable(
    timetable_id: int,
    timetable_period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = (
        db.query(TimetablePeriod)
        .join(Timetable)
        .filter(
            TimetablePeriod.id == timetable_period_id,
            TimetablePeriod.timetable_id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not link:
        raise HTTPException(404, "Timetable period not found")

    db.delete(link)
    db.commit()
