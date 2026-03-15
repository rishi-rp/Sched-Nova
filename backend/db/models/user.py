from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(255), default="admin")
    is_active = Column(Boolean, default=True)

    # ONLY valid relationship
    timetables = relationship(
        "Timetable",
        back_populates="user",
        cascade="all, delete-orphan"
    )
