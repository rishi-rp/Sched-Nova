from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)

    run_id = Column(
        Integer,
        ForeignKey("timetable_runs.id", ondelete="CASCADE"),
        nullable=False
    )

    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)

    timeslot = Column(Integer, nullable=False)

    run = relationship(
        "TimetableRun",
        back_populates="entries"
    )

    __table_args__ = (
        UniqueConstraint(
            "run_id",
            "batch_id",
            "timeslot",
            name="uq_run_batch_timeslot"
        ),
    )
