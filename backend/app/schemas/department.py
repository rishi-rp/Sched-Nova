from pydantic import BaseModel
from typing import Optional


class DepartmentBase(BaseModel):
    name: str


class DepartmentCreate(DepartmentBase):
    pass
    # timetable_id comes from URL


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    id: int
    timetable_id: int
    is_active: bool

    class Config:
        from_attributes = True
