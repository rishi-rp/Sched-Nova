from pydantic import BaseModel
from typing import Optional


class RoomBase(BaseModel):
    name: str
    room_group: str
    building: str
    capacity: Optional[int] = None


class RoomBulkCreate(BaseModel):
    timetable_id: int
    name: str
    room_group: str
    building: str

class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    room_group: Optional[str] = None
    building: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None


class RoomResponse(RoomBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class TimetableRoomCreate(BaseModel):
    timetable_id: int
    room_id: int


class TimetableRoomResponse(BaseModel):
    id: int
    timetable_id: int
    room_id: int

    class Config:
        from_attributes = True
