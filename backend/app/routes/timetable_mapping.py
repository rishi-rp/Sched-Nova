# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.core.dependencies import get_current_user
# from db.session import get_db
# from db.models.user import User
# from db.models.timetable import Timetable
# from db.models.mapping import (
#     TimetableFaculty,
#     TimetableSubject,
#     TimetableRoom,
#     TimetableBatch
# )
# from db.models.faculty import Faculty
# from db.models.subject import Subject
# from db.models.room import Room
# from db.models.batch import Batch

# router = APIRouter(
#     prefix="/timetables/{timetable_id}",
#     tags=["Timetable Mappings"]
# )

# def get_timetable_or_404(db: Session, timetable_id: int, user_id: int):
#     timetable = db.query(Timetable).filter(
#         Timetable.id == timetable_id,
#         Timetable.created_by == user_id
#     ).first()

#     if not timetable:
#         raise HTTPException(404, "Timetable not found")

#     return timetable

# @router.post("/faculties", status_code=status.HTTP_201_CREATED)
# def add_faculty_to_timetable(
#     timetable_id: int,
#     faculty_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     get_timetable_or_404(db, timetable_id, current_user.id)

#     faculty = db.query(Faculty).filter(
#         Faculty.id == faculty_id,
#         Faculty.created_by == current_user.id,
#         Faculty.is_active == True
#     ).first()
#     if not faculty:
#         raise HTTPException(404, "Faculty not found")

#     exists = db.query(TimetableFaculty).filter(
#         TimetableFaculty.timetable_id == timetable_id,
#         TimetableFaculty.faculty_id == faculty_id
#     ).first()
#     if exists:
#         raise HTTPException(400, "Faculty already added")

#     db.add(TimetableFaculty(
#         timetable_id=timetable_id,
#         faculty_id=faculty_id
#     ))
#     db.commit()

#     return {"message": "Faculty added to timetable"}

# @router.delete("/faculties/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
# def remove_faculty_from_timetable(
#     timetable_id: int,
#     faculty_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     get_timetable_or_404(db, timetable_id, current_user.id)

#     mapping = db.query(TimetableFaculty).filter(
#         TimetableFaculty.timetable_id == timetable_id,
#         TimetableFaculty.faculty_id == faculty_id
#     ).first()

#     if not mapping:
#         raise HTTPException(404, "Faculty not mapped")

#     db.delete(mapping)
#     db.commit()
# @router.post("/subjects", status_code=status.HTTP_201_CREATED)
# def add_subject_to_timetable(
#     timetable_id: int,
#     subject_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     get_timetable_or_404(db, timetable_id, current_user.id)

#     subject = db.query(Subject).filter(
#         Subject.id == subject_id,
#         Subject.created_by == current_user.id,
#         Subject.is_active == True
#     ).first()
#     if not subject:
#         raise HTTPException(404, "Subject not found")

#     exists = db.query(TimetableSubject).filter(
#         TimetableSubject.timetable_id == timetable_id,
#         TimetableSubject.subject_id == subject_id
#     ).first()
#     if exists:
#         raise HTTPException(400, "Subject already added")

#     db.add(TimetableSubject(
#         timetable_id=timetable_id,
#         subject_id=subject_id
#     ))
#     db.commit()

#     return {"message": "Subject added to timetable"}

# @router.post("/rooms", status_code=status.HTTP_201_CREATED)
# def add_room_to_timetable(
#     timetable_id: int,
#     room_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     get_timetable_or_404(db, timetable_id, current_user.id)

#     room = db.query(Room).filter(
#         Room.id == room_id,
#         Room.created_by == current_user.id,
#         Room.is_active == True
#     ).first()
#     if not room:
#         raise HTTPException(404, "Room not found")

#     exists = db.query(TimetableRoom).filter(
#         TimetableRoom.timetable_id == timetable_id,
#         TimetableRoom.room_id == room_id
#     ).first()
#     if exists:
#         raise HTTPException(400, "Room already added")

#     db.add(TimetableRoom(
#         timetable_id=timetable_id,
#         room_id=room_id
#     ))
#     db.commit()

#     return {"message": "Room added to timetable"}

# @router.post("/batches", status_code=status.HTTP_201_CREATED)
# def add_batch_to_timetable(
#     timetable_id: int,
#     batch_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     get_timetable_or_404(db, timetable_id, current_user.id)

#     batch = db.query(Batch).filter(
#         Batch.id == batch_id,
#         Batch.created_by == current_user.id,
#         Batch.is_active == True
#     ).first()
#     if not batch:
#         raise HTTPException(404, "Batch not found")

#     exists = db.query(TimetableBatch).filter(
#         TimetableBatch.timetable_id == timetable_id,
#         TimetableBatch.batch_id == batch_id
#     ).first()
#     if exists:
#         raise HTTPException(400, "Batch already added")

#     db.add(TimetableBatch(
#         timetable_id=timetable_id,
#         batch_id=batch_id
#     ))
#     db.commit()

#     return {"message": "Batch added to timetable"}
