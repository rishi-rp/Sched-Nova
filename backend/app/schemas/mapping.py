# from pydantic import BaseModel
# from typing import Optional


# class BatchSubjectFacultyCreate(BaseModel):
#     batch_id: int
#     subject_id: int
#     faculty_id: int


# class BatchSubjectFacultyResponse(BatchSubjectFacultyCreate):
#     id: int
#     is_active: bool

#     class Config:
#         from_attributes = True

# class TimetableFacultyCreate(BaseModel):
#     timetable_id: int
#     faculty_id: int


# class TimetableFacultyResponse(TimetableFacultyCreate):
#     id: int

#     class Config:
#         from_attributes = True

# class TimetableSubjectCreate(BaseModel):
#     timetable_id: int
#     subject_id: int


# class TimetableSubjectResponse(TimetableSubjectCreate):
#     id: int

#     class Config:
#         from_attributes = True

# class TimetableRoomCreate(BaseModel):
#     timetable_id: int
#     room_id: int


# class TimetableRoomResponse(TimetableRoomCreate):
#     id: int

#     class Config:
#         from_attributes = True

# class TimetableBatchCreate(BaseModel):
#     timetable_id: int
#     batch_id: int


# class TimetableBatchResponse(TimetableBatchCreate):
#     id: int

#     class Config:
#         from_attributes = True
