from pydantic import BaseModel
from typing import Optional


# -------------------------
# Base Faculty
# -------------------------
class FacultyBase(BaseModel):
    name: str
    faculty_enrollment: str
    designation: Optional[str] = None


# -------------------------
# Global Faculty Create
# -------------------------
class FacultyCreate(FacultyBase):
    pass


# -------------------------
# Global Faculty Update
# -------------------------
class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    faculty_enrollment: Optional[str] = None
    designation: Optional[str] = None
    is_active: Optional[bool] = None


# -------------------------
# Global Faculty Response
# -------------------------
class FacultyResponse(FacultyBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


# -------------------------
# Bulk Create (Global + Timetable mapping)
# -------------------------
class FacultyBulkCreate(BaseModel):
    timetable_id: int
    name: str
    faculty_enrollment: str


# -------------------------
# Timetable Faculty Mapping
# -------------------------
class TimetableFacultyCreate(BaseModel):
    timetable_id: int
    faculty_id: int
    max_periods_per_day: Optional[int] = None
    max_periods_per_week: Optional[int] = None


class TimetableFacultyResponse(BaseModel):
    id: int
    timetable_id: int
    faculty_id: int
    max_periods_per_day: Optional[int]
    max_periods_per_week: Optional[int]

    class Config:
        from_attributes = True
