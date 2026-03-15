from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.room import RoomBulkCreate
from db.models.room import TimetableRoom


from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse
from app.core.dependencies import get_current_user
from db.session import get_db
from db.models.room import Room
from db.models.user import User

router = APIRouter(prefix="/rooms", tags=["Rooms"])


# -------------------------
# Create Room (GLOBAL)
# -------------------------
@router.post(
    "/",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # unique per user + building + name
    existing = (
        db.query(Room)
        .filter(
            Room.user_id == current_user.id,
            Room.name == data.name,
            Room.building == data.building,
            Room.is_active == True
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Room already exists in this building"
        )

    room = Room(
        **data.dict(),
        user_id=current_user.id
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return room

@router.put(
    "/bulk",
    status_code=status.HTTP_201_CREATED
)
def bulk_create_rooms(
    payload: list[RoomBulkCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload:
        return {"message": "No rooms provided"}

    timetable_id = payload[0].timetable_id

    # 1️⃣ HARD DELETE old timetable-room mappings
    db.query(TimetableRoom).filter(
        TimetableRoom.timetable_id == timetable_id
    ).delete(synchronize_session=False)

    created = []

    for item in payload:
        # 2️⃣ Get or create GLOBAL Room
        room = (
            db.query(Room)
            .filter(
                Room.user_id == current_user.id,
                Room.name == item.name,
                Room.building == item.building,
                Room.is_active == True
            )
            .first()
        )

        if not room:
            room = Room(
                user_id=current_user.id,
                name=item.name,
                room_group=item.room_group,
                building=item.building,
                is_active=True
            )
            db.add(room)
            db.flush()
        else:
            # 3️⃣ Keep room_group in sync
            room.room_group = item.room_group

        # 4️⃣ Re-map to timetable
        db.add(
            TimetableRoom(
                timetable_id=timetable_id,
                room_id=room.id
            )
        )

        created.append(room)

    db.commit()

    return {
        "message": "Timetable rooms replaced successfully",
        "count": len(created)
    }


# -------------------------
# Get Rooms (GLOBAL)
# -------------------------
@router.get("/", response_model=list[RoomResponse])
def get_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Room)
        .filter(
            Room.user_id == current_user.id,
            Room.is_active == True
        )
        .all()
    )


# -------------------------
# Get Single Room
# -------------------------
@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.user_id == current_user.id
        )
        .first()
    )
    if not room:
        raise HTTPException(404, "Room not found")

    return room


# -------------------------
# Update Room
# -------------------------
@router.patch("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.user_id == current_user.id
        )
        .first()
    )
    if not room:
        raise HTTPException(404, "Room not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)

    return room


# -------------------------
# Soft Delete Room
# -------------------------
@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.user_id == current_user.id
        )
        .first()
    )
    if not room:
        raise HTTPException(404, "Room not found")

    room.is_active = False
    db.commit()
