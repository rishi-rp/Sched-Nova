from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.room import Room
from db.models.room import TimetableRoom
from db.models.user import User
from app.schemas.room import RoomResponse, TimetableRoomCreate, TimetableRoomResponse
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/rooms",
    tags=["Timetable Rooms"]
)


@router.post(
    "/",
    response_model=TimetableRoomResponse,
    status_code=status.HTTP_201_CREATED
)
def add_room_to_timetable(
    timetable_id: int,
    data: TimetableRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()
    if not timetable:
        raise HTTPException(404, "Timetable not found")

    room = db.query(Room).filter(
        Room.id == data.room_id,
        Room.user_id == current_user.id,
        Room.is_active == True
    ).first()
    if not room:
        raise HTTPException(404, "Room not found")

    existing = db.query(TimetableRoom).filter(
        TimetableRoom.timetable_id == timetable_id,
        TimetableRoom.room_id == data.room_id
    ).first()
    if existing:
        raise HTTPException(400, "Room already added to timetable")

    link = TimetableRoom(
        timetable_id=timetable_id,
        room_id=data.room_id
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return link


@router.get(
    "/",
    response_model=list[RoomResponse]
)
def list_timetable_rooms(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Room)
        .join(TimetableRoom, TimetableRoom.room_id == Room.id)
        .join(Timetable)
        .filter(
            TimetableRoom.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Room.is_active == True
        )
        .all()
    )



@router.delete(
    "/{timetable_room_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_room_from_timetable(
    timetable_id: int,
    timetable_room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = (
        db.query(TimetableRoom)
        .join(Timetable)
        .filter(
            TimetableRoom.id == timetable_room_id,
            TimetableRoom.timetable_id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not link:
        raise HTTPException(404, "Timetable room not found")

    db.delete(link)
    db.commit()
