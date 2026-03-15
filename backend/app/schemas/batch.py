from pydantic import BaseModel
from typing import Optional


class BatchBase(BaseModel):
    name: str
    year: int

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    is_active: Optional[bool] = None
    
class BatchResponse(BatchBase):
    id: int
    department_id: int
    is_active: bool

    class Config:
        from_attributes = True
