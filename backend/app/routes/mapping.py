# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.schemas.mapping import (
#     BatchSubjectFacultyCreate,
#     BatchSubjectFacultyResponse
# )
# from app.core.dependencies import get_current_user
# from db.session import get_db
# from db.models.mapping import BatchSubjectFaculty
# from db.models.batch import Batch
# from db.models.subject import Subject
# from db.models.faculty import Faculty
# from db.models.user import User

# router = APIRouter(prefix="/mappings", tags=["Mapping"])


# # -------------------------
# # Create Mapping
# # -------------------------
# @router.post("/", response_model=BatchSubjectFacultyResponse, status_code=201)
# def create_mapping(
#     data: BatchSubjectFacultyCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # Validate Batch (ownership + active)
#     batch = db.query(Batch).filter(
#         Batch.id == data.batch_id,
#         Batch.created_by == current_user.id,
#         Batch.is_active == True
#     ).first()
#     if not batch:
#         raise HTTPException(404, "Batch not found")

#     # Validate Subject (same department)
#     subject = db.query(Subject).filter(
#         Subject.id == data.subject_id,
#         Subject.created_by == current_user.id,
#         Subject.department_id == batch.department_id,
#         Subject.is_active == True
#     ).first()
#     if not subject:
#         raise HTTPException(404, "Subject not found or department mismatch")

#     # Validate Faculty (same department)
#     faculty = db.query(Faculty).filter(
#         Faculty.id == data.faculty_id,
#         Faculty.created_by == current_user.id,
#         Faculty.department_id == batch.department_id,
#         Faculty.is_active == True
#     ).first()
#     if not faculty:
#         raise HTTPException(404, "Faculty not found or department mismatch")

#     # Prevent duplicate mapping
#     existing = db.query(BatchSubjectFaculty).filter(
#         BatchSubjectFaculty.batch_id == data.batch_id,
#         BatchSubjectFaculty.subject_id == data.subject_id,
#         BatchSubjectFaculty.faculty_id == data.faculty_id,
#         BatchSubjectFaculty.is_active == True
#     ).first()
#     if existing:
#         raise HTTPException(400, "Mapping already exists")

#     mapping = BatchSubjectFaculty(
#         batch_id=data.batch_id,
#         subject_id=data.subject_id,
#         faculty_id=data.faculty_id,
#         is_active=True
#     )

#     db.add(mapping)
#     db.commit()
#     db.refresh(mapping)

#     return mapping


# # -------------------------
# # Get Mappings
# # -------------------------
# @router.get("/", response_model=list[BatchSubjectFacultyResponse])
# def get_mappings(
#     department_id: int | None = None,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     query = (
#         db.query(BatchSubjectFaculty)
#         .join(Batch)
#         .filter(
#             Batch.created_by == current_user.id,
#             BatchSubjectFaculty.is_active == True
#         )
#     )

#     if department_id:
#         query = query.filter(Batch.department_id == department_id)

#     return query.all()


# # -------------------------
# # Soft Delete Mapping
# # -------------------------
# @router.delete("/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_mapping(
#     mapping_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     mapping = (
#         db.query(BatchSubjectFaculty)
#         .join(Batch)
#         .filter(
#             BatchSubjectFaculty.id == mapping_id,
#             Batch.created_by == current_user.id
#         )
#         .first()
#     )

#     if not mapping:
#         raise HTTPException(404, "Mapping not found")

#     mapping.is_active = False
#     db.commit()
