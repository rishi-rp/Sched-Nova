from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.department import Department
from db.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/departments",
    tags=["Departments"]
)

# -------------------------
# Create Department
# -------------------------
@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_department(
    timetable_id: int,
    department_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    timetable = (
        db.query(Timetable)
        .filter(
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not timetable:
        raise HTTPException(404, "Timetable not found")

    existing = (
        db.query(Department)
        .filter(
            Department.timetable_id == timetable_id,
            Department.name.ilike(department_in.name),
            Department.is_active == True
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Department already exists in this timetable"
        )

    department = Department(
        name=department_in.name.strip(),
        timetable_id=timetable_id,
        is_active=True
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


# -------------------------
# List Departments
# -------------------------
@router.get("/", response_model=list[DepartmentResponse])
def list_departments(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Department)
        .join(Timetable)
        .filter(
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .all()
    )


# -------------------------
# Get Single Department
# -------------------------
@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    timetable_id: int,
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    return department


# -------------------------
# Update Department
# -------------------------
@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    timetable_id: int,
    department_id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    if department_in.name:
        duplicate = (
            db.query(Department)
            .filter(
                Department.timetable_id == timetable_id,
                Department.name.ilike(department_in.name),
                Department.id != department_id,
                Department.is_active == True
            )
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Department name already exists in this timetable"
            )

        department.name = department_in.name.strip()

    if department_in.is_active is not None:
        department.is_active = department_in.is_active

    db.commit()
    db.refresh(department)

    return department


# -------------------------
# Soft Delete Department
# -------------------------
@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_department(
    timetable_id: int,
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    department = (
        db.query(Department)
        .join(Timetable)
        .filter(
            Department.id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not department:
        raise HTTPException(404, "Department not found")

    db.delete(department)
    db.commit()
