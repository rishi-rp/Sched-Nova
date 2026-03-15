from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.faculty import Faculty, TimetableFaculty
from db.models.user import User
from app.schemas.faculty import (
    FacultyBulkCreate,
    FacultyResponse
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/faculties",
    tags=["Timetable Faculties"]
)

# -------------------------------------------------
# BULK REPLACE FACULTIES (Period-style)
# -------------------------------------------------
@router.put(
    "/bulk",
    status_code=status.HTTP_201_CREATED
)
def bulk_replace_timetable_faculties(
    timetable_id: int,
    payload: list[FacultyBulkCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload:
        return {"message": "No faculties provided"}

    timetable = db.query(Timetable).filter(
        Timetable.id == timetable_id,
        Timetable.user_id == current_user.id
    ).first()

    if not timetable:
        raise HTTPException(404, "Timetable not found")

    # 🔥 HARD DELETE old mappings
    db.query(TimetableFaculty).filter(
        TimetableFaculty.timetable_id == timetable_id
    ).delete(synchronize_session=False)

    created = []

    for item in payload:
        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.user_id == current_user.id,
                Faculty.faculty_enrollment == item.faculty_enrollment,
                Faculty.is_active == True
            )
            .first()
        )

        if not faculty:
            faculty = Faculty(
                user_id=current_user.id,
                name=item.name,
                faculty_enrollment=item.faculty_enrollment,
                is_active=True
            )
            db.add(faculty)
            db.flush()
        else:
            faculty.name = item.name

        db.add(
            TimetableFaculty(
                timetable_id=timetable_id,
                faculty_id=faculty.id
            )
        )

        created.append(faculty)

    db.commit()

    return {
        "message": "Timetable faculties replaced successfully",
        "count": len(created)
    }


# -------------------------------------------------
# GET FACULTIES FOR TIMETABLE
# -------------------------------------------------
@router.get("/", response_model=list[FacultyResponse])
def list_timetable_faculties(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Faculty)
        .join(TimetableFaculty, TimetableFaculty.faculty_id == Faculty.id)
        .join(Timetable)
        .filter(
            TimetableFaculty.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Faculty.is_active == True
        )
        .order_by(Faculty.name)
        .all()
    )
