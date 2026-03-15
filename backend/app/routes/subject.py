from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.subject import Subject
from db.models.department import Department
from db.models.timetable import Timetable
from db.models.user import User
from app.schemas.subject import (
    SubjectCreate,
    SubjectUpdate,
    SubjectResponse
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/departments/{department_id}/subjects",
    tags=["Subjects"]
)


# -------------------------
# Create Subject
# -------------------------
@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_subject(
    timetable_id: int,
    department_id: int,
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # verify hierarchy + ownership
    department = (
        db.query(Department)
        .join(Timetable)
        .filter(
            Department.id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Department.is_active == True
        )
        .first()
    )
    if not department:
        raise HTTPException(404, "Department not found")

    existing = (
        db.query(Subject)
        .filter(
            Subject.department_id == department_id,
            Subject.is_active == True,
            (Subject.name == subject_in.name) |
            (Subject.code == subject_in.code)
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Subject with same name or code already exists in this department"
        )

    subject = Subject(
        name=subject_in.name,
        code=subject_in.code,
        class_per_week=subject_in.class_per_week,
        room_group=subject_in.room_group,
        sub_type=subject_in.sub_type,
        department_id=department_id,
        is_active=True
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return subject


# -------------------------
# List Subjects
# -------------------------
@router.get("/", response_model=list[SubjectResponse])
def list_subjects(
    timetable_id: int,
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Subject)
        .join(Department)
        .join(Timetable)
        .filter(
            Subject.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Subject.is_active == True
        )
        .all()
    )


# -------------------------
# Get Single Subject
# -------------------------
@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    timetable_id: int,
    department_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = (
        db.query(Subject)
        .join(Department)
        .join(Timetable)
        .filter(
            Subject.id == subject_id,
            Subject.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Subject.is_active == True
        )
        .first()
    )
    if not subject:
        raise HTTPException(404, "Subject not found")

    return subject


# -------------------------
# Update Subject
# -------------------------
@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    timetable_id: int,
    department_id: int,
    subject_id: int,
    subject_in: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = (
        db.query(Subject)
        .join(Department)
        .join(Timetable)
        .filter(
            Subject.id == subject_id,
            Subject.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Subject.is_active == True
        )
        .first()
    )
    if not subject:
        raise HTTPException(404, "Subject not found")

    for field, value in subject_in.dict(exclude_unset=True).items():
        setattr(subject, field, value)

    db.commit()
    db.refresh(subject)

    return subject


# -------------------------
# Soft Delete Subject
# -------------------------
@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_subject(
    timetable_id: int,
    department_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = (
        db.query(Subject)
        .join(Department)
        .join(Timetable)
        .filter(
            Subject.id == subject_id,
            Subject.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Subject.is_active == True
        )
        .first()
    )
    if not subject:
        raise HTTPException(404, "Subject not found")

    subject.is_active = False
    db.commit()
