from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, UniqueConstraint, Time
from sqlalchemy.orm import relationship
from db.base import Base


class Period(Base):
    __tablename__ = "periods"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    day = Column(String(20), nullable=False)          # Monday, Tuesday, etc.
    period_number = Column(Integer, nullable=False)  # 1, 2, 3...

    start_time = Column(Time, nullable=False)        # ⏰ NEW
    end_time = Column(Time, nullable=False)

    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("user_id", "day", "period_number"),
    )

    # Relationships
    user = relationship("User")
    timetable_periods = relationship(
        "TimetablePeriod",
        back_populates="period",
        cascade="all, delete"
    )


class TimetablePeriod(Base):
    __tablename__ = "timetable_periods"

    id = Column(Integer, primary_key=True, index=True)

    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    period_id = Column(Integer, ForeignKey("periods.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("timetable_id", "period_id"),
    )

    timetable = relationship("Timetable", back_populates="timetable_periods")
    period = relationship("Period", back_populates="timetable_periods")
