from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.period import (
    PeriodCreate,
    PeriodUpdate,
    PeriodBulkCreate,
    PeriodResponse
)
from app.core.dependencies import get_current_user
from db.session import get_db
from db.models.period import Period
from db.models.user import User

router = APIRouter(prefix="/periods", tags=["Periods"])


# -------------------------
# Create Period (GLOBAL)
# -------------------------
@router.post(
    "/",
    response_model=PeriodResponse,
    status_code=status.HTTP_201_CREATED
)
def create_period(
    data: PeriodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # unique per user + day + period_number
    existing = (
        db.query(Period)
        .filter(
            Period.user_id == current_user.id,
            Period.day == data.day,
            Period.period_number == data.period_number,
            Period.is_active == True
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Period already exists"
        )

    period = Period(
        **data.dict(),
        user_id=current_user.id
    )

    db.add(period)
    db.commit()
    db.refresh(period)

    return period

from db.models.period import Period, TimetablePeriod

@router.put(
    "/bulk",
    status_code=status.HTTP_201_CREATED
)
def bulk_create_periods(
    payload: list[PeriodBulkCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload:
        return {"message": "No periods provided"}

    timetable_id = payload[0].timetable_id

    # 1️⃣ HARD DELETE old timetable mappings
    db.query(TimetablePeriod).filter(
        TimetablePeriod.timetable_id == timetable_id
    ).delete(synchronize_session=False)

    created = []

    for item in payload:
        # 2️⃣ Get or create global Period
        period = (
            db.query(Period)
            .filter(
                Period.user_id == current_user.id,
                Period.day == item.day,
                Period.period_number == item.period_number,
                Period.is_active == True
            )
            .first()
        )

        if not period:
            period = Period(
                user_id=current_user.id,
                day=item.day,
                period_number=item.period_number,
                start_time=item.start_time,
                end_time=item.end_time,
                is_active=True
            )
            db.add(period)
            db.flush()
        else:
            # 3️⃣ Keep period times in sync
            period.start_time = item.start_time
            period.end_time = item.end_time

        # 4️⃣ Re-map to timetable
        db.add(
            TimetablePeriod(
                timetable_id=timetable_id,
                period_id=period.id
            )
        )

        created.append(period)

    db.commit()
    return {
        "message": "Timetable periods replaced successfully",
        "count": len(created)
    }


# -------------------------
# Get Periods (GLOBAL)
# -------------------------
@router.get("/", response_model=list[PeriodResponse])
def get_periods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Period)
        .filter(
            Period.user_id == current_user.id,
            Period.is_active == True
        )
        .order_by(Period.day, Period.period_number)
        .all()
    )


# -------------------------
# Get Single Period
# -------------------------
@router.get("/{period_id}", response_model=PeriodResponse)
def get_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    period = (
        db.query(Period)
        .filter(
            Period.id == period_id,
            Period.user_id == current_user.id
        )
        .first()
    )
    if not period:
        raise HTTPException(404, "Period not found")

    return period


# -------------------------
# Update Period
# -------------------------
@router.patch("/{period_id}", response_model=PeriodResponse)
def update_period(
    period_id: int,
    data: PeriodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    period = (
        db.query(Period)
        .filter(
            Period.id == period_id,
            Period.user_id == current_user.id
        )
        .first()
    )
    if not period:
        raise HTTPException(404, "Period not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(period, field, value)

    db.commit()
    db.refresh(period)

    return period


# -------------------------
# Soft Delete Period
# -------------------------
@router.delete(
    "/{period_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    period = (
        db.query(Period)
        .filter(
            Period.id == period_id,
            Period.user_id == current_user.id
        )
        .first()
    )
    if not period:
        raise HTTPException(404, "Period not found")

    period.is_active = False
    db.commit()
