from pydantic import BaseModel
from typing import Optional


class SubjectBase(BaseModel):
    name: str
    code: str
    class_per_week: int
    room_group: str
    sub_type: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    class_per_week: Optional[int] = None
    room_group: Optional[str] = None
    sub_type: Optional[str] = None
    is_active: Optional[bool] = None

class SubjectResponse(SubjectBase):
    id: int
    department_id: int
    is_active: bool

    class Config:
        from_attributes = True
