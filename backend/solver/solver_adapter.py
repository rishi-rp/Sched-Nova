from sqlalchemy.orm import Session

from db.models.department import Department
from db.models.batch import Batch
from db.models.subject import Subject
from db.models.faculty import Faculty
from db.models.room import Room

from db.models.faculty import TimetableFaculty
from db.models.room import TimetableRoom
from db.models.period import TimetablePeriod


def build_solver_input(db: Session, timetable_id: int):
    # ---------------------------
    # Departments under timetable
    # ---------------------------
    departments = (
        db.query(Department)
        .filter(
            Department.timetable_id == timetable_id,
            Department.is_active == True
        )
        .all()
    )

    department_ids = [d.id for d in departments]

    # ---------------------------
    # Batches (via departments)
    # ---------------------------
    batches = (
        db.query(Batch)
        .filter(
            Batch.department_id.in_(department_ids),
            Batch.is_active == True
        )
        .all()
    )

    # ---------------------------
    # Subjects (via departments)
    # ---------------------------
    subjects = (
        db.query(Subject)
        .filter(
            Subject.department_id.in_(department_ids),
            Subject.is_active == True
        )
        .all()
    )

    # ---------------------------
    # Faculties (timetable-local)
    # ---------------------------
    timetable_faculties = (
        db.query(TimetableFaculty)
        .filter(TimetableFaculty.timetable_id == timetable_id)
        .all()
    )

    faculty_ids = [tf.faculty_id for tf in timetable_faculties]

    faculties = (
        db.query(Faculty)
        .filter(
            Faculty.id.in_(faculty_ids),
            Faculty.is_active == True
        )
        .all()
    )

    # ---------------------------
    # Rooms (timetable-local)
    # ---------------------------
    timetable_rooms = (
        db.query(TimetableRoom)
        .filter(TimetableRoom.timetable_id == timetable_id)
        .all()
    )

    room_ids = [tr.room_id for tr in timetable_rooms]

    rooms_qs = (
        db.query(Room)
        .filter(
            Room.id.in_(room_ids),
            Room.is_active == True
        )
        .all()
    )

    rooms = {
        r.id: {
            "room_group": r.room_group,
            "building": r.building
        }
        for r in rooms_qs
    }

    # ---------------------------
    # Periods → timeslots
    # ---------------------------
    periods = (
        db.query(TimetablePeriod)
        .filter(TimetablePeriod.timetable_id == timetable_id)
        .all()
    )

    timeslots = len(periods)

    # ---------------------------
    # Batch → Subjects eligibility
    # ---------------------------
    # SIMPLE RULE (current design):
    # Every batch can take every subject in its department
    batch_subjects = {}

    for b in batches:
        batch_subjects[b.id] = {}
        for s in subjects:
            if s.department_id != b.department_id:
                continue

            # all timetable faculties can teach (constraint handled in solver)
            batch_subjects[b.id][s.id] = faculty_ids.copy()

    # ---------------------------
    # Subjects data
    # ---------------------------
    subjects_data = {
        s.id: {
            "per_week": s.class_per_week,
            "room_group": s.room_group,
            "type": s.sub_type
        }
        for s in subjects
    }

    # ---------------------------
    # Faculties data
    # ---------------------------
    faculties_data = {
        f.id: {
            "name": f.name
        }
        for f in faculties
    }

    # ---------------------------
    # Final solver input
    # ---------------------------
    return {
        "batches": [b.id for b in batches],
        "subjects": subjects_data,
        "faculties": faculties_data,
        "rooms": rooms,
        "batch_subject_faculty": batch_subjects,
        "timeslots": timeslots
    }
