# app/routes/timetable.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.timetable import TimetableCreate, TimetableResponse

router = APIRouter(prefix="/timetables", tags=["Timetables"])


@router.post("/", response_model=TimetableResponse, status_code=status.HTTP_201_CREATED)
def create_timetable(
    data: TimetableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = Timetable(
        name=data.name,
        user_id=current_user.id
    )
    db.add(timetable)
    db.commit()
    db.refresh(timetable)
    return timetable


@router.get("/", response_model=list[TimetableResponse])
def list_timetables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Timetable).filter(
        Timetable.user_id == current_user.id
    ).all()


@router.get("/{timetable_id}", response_model=TimetableResponse)
def get_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()
    if not timetable:
        raise HTTPException(404, "Timetable not found")
    return timetable


@router.delete("/{timetable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()
    if not timetable:
        raise HTTPException(404, "Timetable not found")

    db.delete(timetable)
    db.commit()
