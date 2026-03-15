# from sqlalchemy import Column, Integer, ForeignKey, Boolean, UniqueConstraint
# from db.base import Base

# class BatchSubjectFaculty(Base):
#     __tablename__ = "batch_subject_faculty"

#     id = Column(Integer, primary_key=True, index=True)

#     batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
#     subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
#     faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)

#     is_active = Column(Boolean, default=True)

#     __table_args__ = (
#         UniqueConstraint("batch_id", "subject_id", "faculty_id"),
#     )

# class TimetableFaculty(Base):
#     __tablename__ = "timetable_faculties"

#     id = Column(Integer, primary_key=True, index=True)
#     timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
#     faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)

#     __table_args__ = (
#         UniqueConstraint("timetable_id", "faculty_id"),
#     )


# class TimetableSubject(Base):
#     __tablename__ = "timetable_subjects"

#     id = Column(Integer, primary_key=True, index=True)
#     timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
#     subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

#     __table_args__ = (
#         UniqueConstraint("timetable_id", "subject_id"),
#     )


# class TimetableRoom(Base):
#     __tablename__ = "timetable_rooms"

#     id = Column(Integer, primary_key=True, index=True)
#     timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
#     room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)

#     __table_args__ = (
#         UniqueConstraint("timetable_id", "room_id"),
#     )


# class TimetableBatch(Base):
#     __tablename__ = "timetable_batches"

#     id = Column(Integer, primary_key=True, index=True)
#     timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
#     batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)

#     __table_args__ = (
#         UniqueConstraint("timetable_id", "batch_id"),
#     )
