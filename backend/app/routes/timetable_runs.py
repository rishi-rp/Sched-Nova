from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.timetable import Timetable
from db.models.timetable_runs import TimetableRun
from db.models.timetable_entry import TimetableEntry
from db.models.user import User

from app.schemas.timetable import (
    SaveTimetableRequest,
    TimetableRunResponse
)
from app.core.dependencies import get_current_user
from solver.timetable_solver import solve_from_database

router = APIRouter(
    prefix="/timetables/{timetable_id}/runs",
    tags=["Timetable Runs"]
)

# -------------------------
# Run Solver (NO SAVE)
# -------------------------
@router.post("/solve")
def solve_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    return solve_from_database(db, timetable_id)


# -------------------------
# Save Solver Result
# -------------------------
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def save_timetable_run(
    timetable_id: int,
    payload: SaveTimetableRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    if payload.solver_output.status != "success":
        raise HTTPException(400, "Solver did not produce a valid timetable")

    run = TimetableRun(
        timetable_id=timetable_id,
        name=payload.name,
        status=payload.solver_output.status,
        time_taken=payload.solver_output.time_taken
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    for a in payload.solver_output.assignments:
        db.add(
            TimetableEntry(
                run_id=run.id,
                batch_id=a.batch_id,
                subject_id=a.subject_id,
                faculty_id=a.faculty_id,
                room_id=a.room_id,
                timeslot=a.timeslot
            )
        )

    db.commit()

    return {
        "message": "Timetable saved successfully",
        "run_id": run.id
    }


# -------------------------
# List Runs
# -------------------------
@router.get("/", response_model=list[TimetableRunResponse])
def list_runs(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(TimetableRun)
        .join(Timetable)
        .filter(
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .order_by(TimetableRun.created_at.desc())
        .all()
    )


# -------------------------
# Get Run
# -------------------------
@router.get("/{run_id}", response_model=TimetableRunResponse)
def get_run(
    timetable_id: int,
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = (
        db.query(TimetableRun)
        .join(Timetable)
        .filter(
            TimetableRun.id == run_id,
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not run:
        raise HTTPException(404, "Timetable run not found")

    return run


# -------------------------
# Get Run Entries
# -------------------------
@router.get("/{run_id}/entries")
def get_run_entries(
    timetable_id: int,
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = (
        db.query(TimetableRun)
        .join(Timetable)
        .filter(
            TimetableRun.id == run_id,
            Timetable.id == timetable_id,
            Timetable.user_id == current_user.id
        )
        .first()
    )
    if not run:
        raise HTTPException(404, "Timetable run not found")

    entries = (
        db.query(TimetableEntry)
        .filter(TimetableEntry.run_id == run_id)
        .all()
    )

    return {
        "run_id": run.id,
        "entries": entries
    }
