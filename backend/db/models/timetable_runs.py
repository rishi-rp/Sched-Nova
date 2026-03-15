from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base


class TimetableRun(Base):
    __tablename__ = "timetable_runs"

    id = Column(Integer, primary_key=True, index=True)

    timetable_id = Column(
        Integer,
        ForeignKey("timetables.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(100), nullable=False)
    status = Column(String(20))   # success / failed
    time_taken = Column(Float)    # seconds

    created_at = Column(DateTime, server_default=func.now())

    # -------------------------
    # Relationships
    # -------------------------

    timetable = relationship(
        "Timetable",
        back_populates="runs"
    )

    entries = relationship(
        "TimetableEntry",
        back_populates="run",
        cascade="all, delete-orphan"
    )
