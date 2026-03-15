from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)   # e.g. A, B, C
    year = Column(Integer, nullable=False)       # e.g. 1, 2, 3, 4

    # 🔑 Batch is LOCAL to Department (which is local to Timetable)
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False
    )

    is_active = Column(Boolean, default=True)

    # -------------------------
    # Relationships
    # -------------------------

    department = relationship(
        "Department",
        back_populates="batches"
    )

    __table_args__ = (
        UniqueConstraint(
            "department_id",
            "name",
            "year",
            name="uq_department_batch"
        ),
    )
