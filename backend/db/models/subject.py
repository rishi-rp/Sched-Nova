from sqlalchemy import (
    Column, Integer, String, Boolean,
    ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False)

    class_per_week = Column(Integer, nullable=False)
    room_group = Column(String(100), nullable=False)   # lab / classroom
    sub_type = Column(String(100), nullable=False)     # theory / practical

    is_active = Column(Boolean, default=True)

    # 🔑 Subject is LOCAL to Department
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False
    )

    # -------------------------
    # Relationships
    # -------------------------

    department = relationship(
        "Department",
        back_populates="subjects"
    )

    __table_args__ = (
        UniqueConstraint(
            "department_id",
            "name",
            name="uq_department_subject_name"
        ),
        UniqueConstraint(
            "department_id",
            "code",
            name="uq_department_subject_code"
        ),
    )
