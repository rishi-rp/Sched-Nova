from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.batch import Batch
from db.models.department import Department
from db.models.timetable import Timetable
from db.models.user import User
from app.schemas.batch import (
    BatchCreate,
    BatchUpdate,
    BatchResponse
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/timetables/{timetable_id}/departments/{department_id}/batches",
    tags=["Batches"]
)


# -------------------------
# Create Batch
# -------------------------
@router.post(
    "/",
    response_model=BatchResponse,
    status_code=status.HTTP_201_CREATED
)
def create_batch(
    timetable_id: int,
    department_id: int,
    batch_in: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # verify ownership + hierarchy
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
        db.query(Batch)
        .filter(
            Batch.department_id == department_id,
            Batch.name == batch_in.name,
            Batch.year == batch_in.year,
            Batch.is_active == True
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Batch already exists for this department and year"
        )

    batch = Batch(
        name=batch_in.name,
        year=batch_in.year,
        department_id=department_id,
        is_active=True
    )

    db.add(batch)
    db.commit()
    db.refresh(batch)

    return batch


# -------------------------
# List Batches
# -------------------------
@router.get("/", response_model=list[BatchResponse])
def list_batches(
    timetable_id: int,
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Batch)
        .join(Department)
        .join(Timetable)
        .filter(
            Batch.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Batch.is_active == True
        )
        .all()
    )


# -------------------------
# Get Single Batch
# -------------------------
@router.get("/{batch_id}", response_model=BatchResponse)
def get_batch(
    timetable_id: int,
    department_id: int,
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batch = (
        db.query(Batch)
        .join(Department)
        .join(Timetable)
        .filter(
            Batch.id == batch_id,
            Batch.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Batch.is_active == True
        )
        .first()
    )
    if not batch:
        raise HTTPException(404, "Batch not found")

    return batch


# -------------------------
# Update Batch
# -------------------------
@router.put("/{batch_id}", response_model=BatchResponse)
def update_batch(
    timetable_id: int,
    department_id: int,
    batch_id: int,
    batch_in: BatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batch = (
        db.query(Batch)
        .join(Department)
        .join(Timetable)
        .filter(
            Batch.id == batch_id,
            Batch.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Batch.is_active == True
        )
        .first()
    )
    if not batch:
        raise HTTPException(404, "Batch not found")

    for field, value in batch_in.dict(exclude_unset=True).items():
        setattr(batch, field, value)

    db.commit()
    db.refresh(batch)

    return batch


# -------------------------
# Soft Delete Batch
# -------------------------
@router.delete(
    "/{batch_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_batch(
    timetable_id: int,
    department_id: int,
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batch = (
        db.query(Batch)
        .join(Department)
        .join(Timetable)
        .filter(
            Batch.id == batch_id,
            Batch.department_id == department_id,
            Department.timetable_id == timetable_id,
            Timetable.user_id == current_user.id,
            Batch.is_active == True
        )
        .first()
    )
    if not batch:
        raise HTTPException(404, "Batch not found")

    batch.is_active = False
    db.commit()
