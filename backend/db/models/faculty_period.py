from sqlalchemy import (
    Column, Integer, Boolean, ForeignKey, UniqueConstraint
)
from db.base import Base


class FacultyPeriodAvailability(Base):
    __tablename__ = "faculty_period_availability"

    id = Column(Integer, primary_key=True, index=True)

    timetable_id = Column(
        Integer,
        ForeignKey("timetables.id", ondelete="CASCADE"),
        nullable=False
    )

    faculty_id = Column(
        Integer,
        ForeignKey("faculties.id", ondelete="CASCADE"),
        nullable=False
    )

    period_id = Column(
        Integer,
        ForeignKey("periods.id", ondelete="CASCADE"),
        nullable=False
    )

    is_available = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint(
            "timetable_id",
            "faculty_id",
            "period_id",
            name="uq_faculty_period"
        ),
    )
