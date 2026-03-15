from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from db.base import Base
from db.session import engine

# -------------------------
# Routers
# -------------------------
from app.routes.auth import router as auth_router

# Global entities
from app.routes.period import router as period_router
from app.routes.room import router as room_router
from app.routes.faculty import router as faculty_router

# Timetable core
from app.routes.department import router as department_router
from app.routes.batch import router as batch_router
from app.routes.subject import router as subject_router

# Timetable local mappings
from app.routes.timetable_periods import router as timetable_periods_router
from app.routes.timetable_rooms import router as timetable_rooms_router
from app.routes.timetable_faculties import router as timetable_faculties_router
from app.routes.timetable import router as timetable_router
from app.routes.faculty_period import router as faculty_period_router
# Solver / runs
from app.routes.timetable_runs import router as timetable_runs_router


# -------------------------
# Import ALL models
# -------------------------
from db.models import (
    user,
    period,
    room,
    faculty,
    faculty_period,
    timetable,
    department,
    batch,
    subject,
    timetable_runs,
    timetable_entry,
)

# -------------------------
# App init
# -------------------------
app = FastAPI(
    title="SchedNova API",
    description="Automated Timetable Generator Backend",
    version="1.0.0",
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Create DB tables
# -------------------------
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# -------------------------
# Register Routers
# -------------------------
app.include_router(auth_router)

# Global
app.include_router(period_router)
app.include_router(room_router)
app.include_router(faculty_router)

# Timetable core
app.include_router(department_router)
app.include_router(batch_router)
app.include_router(subject_router)

# Timetable local
app.include_router(timetable_router)
app.include_router(timetable_periods_router)
app.include_router(timetable_rooms_router)
app.include_router(timetable_faculties_router)
app.include_router(faculty_period_router)

# Solver / runs
app.include_router(timetable_runs_router)

# -------------------------
# Health check
# -------------------------
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "SchedNova backend is running 🚀"}
