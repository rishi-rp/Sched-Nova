from pydantic import BaseModel
from typing import Dict, List


class FacultyPeriodAvailabilityInput(BaseModel):
    faculty_id: int
    availability: Dict[str, List[int]]

