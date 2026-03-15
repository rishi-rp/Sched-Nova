from ortools.sat.python import cp_model
import time


def run_solver(solver_input: dict) -> dict:
    """
    Pure solver engine.
    Takes solver_input dict.
    Returns solver_output dict.
    """

    t_start_time = time.time()

    model = cp_model.CpModel()

    # -----------------------------
    # Unpack solver input
    # -----------------------------
    batches = solver_input["batches"]
    timeslots = list(range(solver_input["timeslots"]))
    rooms = solver_input["rooms"]
    teachers = solver_input["teachers"]
    subjects = solver_input["subjects"]
    batch_subjects = solver_input["batch_subjects"]
    fixed_groups = solver_input["fixed_groups"]

    # -----------------------------
    # Decision variables
    # -----------------------------
    x = {}
    group_x = {}

    for s in fixed_groups:
        for group in fixed_groups[s]:
            group = tuple(group)
            for t in timeslots:
                for r in rooms:
                    for teacher in subjects[s]["teachers"]:
                        var = model.NewBoolVar(
                            f"group_x_{group}_{s}_{t}_{r}_{teacher}"
                        )
                        group_x[group, s, t, r, teacher] = var
                        for b in group:
                            x[b, s, t, r, teacher] = var

    # -----------------------------
    # Subject frequency constraints
    # -----------------------------
    for s in fixed_groups:
        for group in fixed_groups[s]:
            group = tuple(group)
            per_week = subjects[s]["per_week"]
            model.Add(
                sum(
                    group_x[group, s, t, r, teacher]
                    for t in timeslots
                    for r in rooms
                    for teacher in subjects[s]["teachers"]
                ) == per_week
            )

    # -----------------------------
    # Teacher availability
    # -----------------------------
    for b in batches:
        for s in batch_subjects.get(b, {}):
            for t in timeslots:
                for r in rooms:
                    for teacher in subjects[s]["teachers"]:
                        if t not in teachers[teacher]["available_shifts"]:
                            model.Add(x[b, s, t, r, teacher] == 0)

    # -----------------------------
    # Room type constraint
    # -----------------------------
    for b in batches:
        for s in batch_subjects.get(b, {}):
            for t in timeslots:
                for r, r_type in rooms.items():
                    for teacher in subjects[s]["teachers"]:
                        if r_type != subjects[s]["room_type"]:
                            model.Add(x[b, s, t, r, teacher] == 0)

    # -----------------------------
    # Teacher clash constraint
    # -----------------------------
    for teacher in teachers:
        for t in timeslots:
            model.Add(
                sum(
                    group_x[group, s, t, r, teacher]
                    for s in fixed_groups
                    for group in map(tuple, fixed_groups[s])
                    for r in rooms
                    if teacher in subjects[s]["teachers"]
                ) <= 1
            )

    # -----------------------------
    # Room clash constraint
    # -----------------------------
    for r in rooms:
        for t in timeslots:
            model.Add(
                sum(
                    group_x[group, s, t, r, teacher]
                    for s in fixed_groups
                    for group in map(tuple, fixed_groups[s])
                    for teacher in subjects[s]["teachers"]
                ) <= 1
            )

    # -----------------------------
    # Batch clash constraint
    # -----------------------------
    for b in batches:
        for t in timeslots:
            model.Add(
                sum(
                    x[b, s, t, r, teacher]
                    for s in batch_subjects.get(b, {})
                    for r in rooms
                    for teacher in subjects[s]["teachers"]
                ) <= 1
            )

    # -----------------------------
    # Teacher selection per group-subject
    # -----------------------------
    y = {}

    for s in fixed_groups:
        for group in fixed_groups[s]:
            group = tuple(group)
            for teacher in subjects[s]["teachers"]:
                y[group, s, teacher] = model.NewBoolVar(
                    f"y_{group}_{s}_{teacher}"
                )

            model.Add(
                sum(y[group, s, teacher] for teacher in subjects[s]["teachers"]) == 1
            )

            for t in timeslots:
                for r in rooms:
                    for teacher in subjects[s]["teachers"]:
                        model.Add(
                            group_x[group, s, t, r, teacher]
                            <= y[group, s, teacher]
                        )

    # -----------------------------
    # Solve
    # -----------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60
    solver.parameters.num_search_workers = 2

    status = solver.Solve(model)
    t_end_time = time.time()

    # -----------------------------
    # Build output
    # -----------------------------
    assignments = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (b, s, t, r, teacher), var in x.items():
            if solver.Value(var) == 1:
                assignments.append({
                    "batch": b,
                    "subject": s,
                    "timeslot": t,
                    "room": r,
                    "teacher": teacher
                })

        solver_status = "4"
    else:
        solver_status = "1"

    return {
        "status": solver_status,
        "assignments": assignments,
        "time_taken": round(t_end_time - t_start_time, 2),
        "message": None if solver_status == "4" else "No feasible solution found"
    }
