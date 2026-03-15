from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.base import Base


class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    # 🔑 Timetable belongs to ONE user
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(DateTime, server_default=func.now())

    # -------------------------
    # Relationships
    # -------------------------

    user = relationship(
        "User",
        back_populates="timetables"
    )

    # -------------------------
    # LOCAL TABLES
    # -------------------------

    departments = relationship(
        "Department",
        back_populates="timetable",
        cascade="all, delete-orphan"
    )

    timetable_periods = relationship(
        "TimetablePeriod",
        back_populates="timetable",
        cascade="all, delete-orphan"
    )

    timetable_rooms = relationship(
        "TimetableRoom",
        back_populates="timetable",
        cascade="all, delete-orphan"
    )

    timetable_faculties = relationship(
        "TimetableFaculty",
        back_populates="timetable",
        cascade="all, delete-orphan"
    )

    # Optional: solver runs / versions
    runs = relationship(
        "TimetableRun",
        back_populates="timetable",
        cascade="all, delete-orphan"
    )
