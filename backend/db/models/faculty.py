from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base


class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(150), nullable=False)

    faculty_enrollment = Column(String(100), nullable=False)

    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "faculty_enrollment",
            name="uq_user_faculty_enrollment"
        ),
    )

    # Relationships
    user = relationship("User")

    timetable_faculties = relationship(
        "TimetableFaculty",
        back_populates="faculty",
        cascade="all, delete-orphan"
    )


class TimetableFaculty(Base):
    __tablename__ = "timetable_faculties"

    id = Column(Integer, primary_key=True, index=True)

    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)

    max_periods_per_day = Column(Integer, nullable=True)
    max_periods_per_week = Column(Integer, nullable=True)

    __table_args__ = (
        UniqueConstraint("timetable_id", "faculty_id"),
    )

    timetable = relationship("Timetable", back_populates="timetable_faculties")
    faculty = relationship("Faculty", back_populates="timetable_faculties")
