from sqlalchemy.orm import Session
from solver.solver_adapter import build_solver_input
from solver.solver_engine import run_solver


def solve_from_database(db: Session, timetable_id: int) -> dict:
    """
    Build solver input strictly from timetable-local mappings
    and run the solver.
    """
    solver_input = build_solver_input(db, timetable_id)
    solver_output = run_solver(solver_input)
    return solver_output
