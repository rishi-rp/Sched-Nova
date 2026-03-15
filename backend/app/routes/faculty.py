from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.faculty import FacultyBulkCreate
from db.models.faculty import TimetableFaculty

from app.schemas.faculty import (
    FacultyCreate,
    FacultyUpdate,
    FacultyResponse
)
from app.core.dependencies import get_current_user
from db.session import get_db
from db.models.faculty import Faculty
from db.models.user import User

router = APIRouter(prefix="/faculties", tags=["Faculty"])


# -------------------------
# Create Faculty (GLOBAL)
# -------------------------
@router.post(
    "/",
    response_model=FacultyResponse,
    status_code=status.HTTP_201_CREATED
)
def create_faculty(
    data: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # unique per user + email
    existing = (
        db.query(Faculty)
        .filter(
            Faculty.user_id == current_user.id,
            Faculty.email == data.email,
            Faculty.is_active == True
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Faculty with this email already exists"
        )

    faculty = Faculty(
        **data.dict(),
        user_id=current_user.id
    )

    db.add(faculty)
    db.commit()
    db.refresh(faculty)

    return faculty



@router.put(
    "/bulk",
    status_code=status.HTTP_201_CREATED
)
def bulk_create_faculties(
    payload: list[FacultyBulkCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload:
        return {"message": "No faculties provided"}

    timetable_id = payload[0].timetable_id

    # 1️⃣ HARD DELETE old timetable mappings
    db.query(TimetableFaculty).filter(
        TimetableFaculty.timetable_id == timetable_id
    ).delete(synchronize_session=False)

    created = []

    for item in payload:
        # 2️⃣ Get or create global Faculty
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
            faculty.faculty_enrollment = item.faculty_enrollment

        # 4️⃣ Re-map to timetable
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

# -------------------------
# Get Faculties (GLOBAL)
# -------------------------
@router.get("/", response_model=list[FacultyResponse])
def get_faculties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Faculty)
        .filter(
            Faculty.user_id == current_user.id,
            Faculty.is_active == True
        )
        .all()
    )


# -------------------------
# Get Single Faculty
# -------------------------
@router.get("/{faculty_id}", response_model=FacultyResponse)
def get_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    faculty = (
        db.query(Faculty)
        .filter(
            Faculty.id == faculty_id,
            Faculty.user_id == current_user.id
        )
        .first()
    )
    if not faculty:
        raise HTTPException(404, "Faculty not found")

    return faculty


# -------------------------
# Update Faculty
# -------------------------
@router.patch("/{faculty_id}", response_model=FacultyResponse)
def update_faculty(
    faculty_id: int,
    data: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    faculty = (
        db.query(Faculty)
        .filter(
            Faculty.id == faculty_id,
            Faculty.user_id == current_user.id
        )
        .first()
    )
    if not faculty:
        raise HTTPException(404, "Faculty not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(faculty, field, value)

    db.commit()
    db.refresh(faculty)

    return faculty


# -------------------------
# Soft Delete Faculty
# -------------------------
@router.delete(
    "/{faculty_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    faculty = (
        db.query(Faculty)
        .filter(
            Faculty.id == faculty_id,
            Faculty.user_id == current_user.id
        )
        .first()
    )
    if not faculty:
        raise HTTPException(404, "Faculty not found")

    faculty.is_active = False
    db.commit()
