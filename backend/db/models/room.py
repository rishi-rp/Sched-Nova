from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(100), nullable=False)
    room_group = Column(String(50), nullable=False)   # lab / classroom / seminar
    building = Column(String(100), nullable=False)

    capacity = Column(Integer, nullable=True)

    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("user_id", "name", "building"),
    )

    # Relationships
    user = relationship("User")
    timetable_rooms = relationship(
        "TimetableRoom",
        back_populates="room",
        cascade="all, delete"
    )


class TimetableRoom(Base):
    __tablename__ = "timetable_rooms"

    id = Column(Integer, primary_key=True, index=True)

    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("timetable_id", "room_id"),
    )

    timetable = relationship("Timetable", back_populates="timetable_rooms")
    room = relationship("Room", back_populates="timetable_rooms")
