from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class TimetableCreate(BaseModel):
    name: str


class TimetableAssignment(BaseModel):
    batch_id: int
    subject_id: int
    faculty_id: int
    room_id: int
    timeslot: int


class SolverResult(BaseModel):
    status: str
    assignments: List[TimetableAssignment]
    time_taken: float
    message: Optional[str] = None


class SolverAssignment(BaseModel):
    batch_id: int
    subject_id: int
    faculty_id: int
    room_id: int
    timeslot: int


class SolverOutput(BaseModel):
    status: str                   # success / failed
    assignments: List[SolverAssignment]
    time_taken: float
    message: Optional[str] = None


class SaveTimetableRequest(BaseModel):
    name: str
    solver_output: SolverOutput


class TimetableRunResponse(BaseModel):
    id: int
    timetable_id: int
    name: str
    status: str
    time_taken: float

    class Config:
        from_attributes = True


class TimetableResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
