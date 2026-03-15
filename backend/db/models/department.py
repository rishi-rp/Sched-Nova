from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    # 🔑 Department is LOCAL to ONE timetable
    timetable_id = Column(
        Integer,
        ForeignKey("timetables.id", ondelete="CASCADE"),
        nullable=False
    )

    is_active = Column(Boolean, default=True)

    # -------------------------
    # Relationships
    # -------------------------

    timetable = relationship(
        "Timetable",
        back_populates="departments"
    )

    batches = relationship(
        "Batch",
        back_populates="department",
        cascade="all, delete-orphan"
    )

    subjects = relationship(
        "Subject",
        back_populates="department",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint(
            "timetable_id",
            "name",
            name="uq_timetable_department"
        ),
    )
