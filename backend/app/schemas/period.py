from pydantic import BaseModel
from typing import Optional
from datetime import time
from pydantic import BaseModel
from datetime import time


# -------------------------
# Period (global, per user)
# -------------------------
class PeriodBase(BaseModel):
    day: str
    period_number: int
    start_time: time
    end_time: time


class PeriodCreate(PeriodBase):
    pass


class PeriodBulkCreate(BaseModel):
    timetable_id: int
    day: str
    period_number: int
    start_time: time
    end_time: time

class PeriodUpdate(BaseModel):
    day: Optional[str] = None
    period_number: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_active: Optional[bool] = None


class PeriodResponse(PeriodBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


# -------------------------
# TimetablePeriod (mapping)
# -------------------------
class TimetablePeriodCreate(BaseModel):
    timetable_id: int
    period_id: int


class TimetablePeriodResponse(BaseModel):
    id: int
    timetable_id: int
    period_id: int

    class Config:
        from_attributes = True
