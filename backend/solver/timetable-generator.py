from ortools.sat.python import cp_model
import time

t_start_time = time.time()

model = cp_model.CpModel()

batches = [f"Batch{i}" for i in range(1, 13)]
timeslots = list(range(35))  # 5 days * 7 shifts

rooms = {
    "LH1": "Lecture",
    "LH2": "Lecture",
    "LH3": "Lecture",
    "LH4": "Lecture",
    "Lab1": "Lab",
    "Lab2": "Lab",
    "Lab3": "Lab"
}

# Teachers
teachers = {
    "Dr. Sharma": {"subjects": ["Math", "Physics"], "available_shifts": list(range(35))},
    "Prof. Singh": {"subjects": ["Chemistry", "Biology"], "available_shifts": list(range(0, 35, 2))},
    "Dr. Gupta": {"subjects": ["ComputerLab", "English"], "available_shifts": list(range(5, 35))},
    "Dr. Verma": {"subjects": ["Math", "Physics", "Chemistry", "English"], "available_shifts": list(range(0, 30))},
    "Dr. Kapoor": {"subjects": ["History", "Geography"], "available_shifts": list(range(0, 35))},
    "Prof. Mehta": {"subjects": ["ComputerLab", "Physics"], "available_shifts": list(range(10, 35))},
    "Dr. Iyer": {"subjects": ["English", "Biology"], "available_shifts": list(range(0, 20))}
}

# Subjects
subjects = {
    "Math": {"teachers": ["Dr. Sharma", "Dr. Verma"], "room_type": "Lecture", "per_week": 4},
    "Physics": {"teachers": ["Dr. Sharma", "Dr. Verma", "Prof. Mehta"], "room_type": "Lecture", "per_week": 3},
    "Chemistry": {"teachers": ["Prof. Singh", "Dr. Verma"], "room_type": "Lecture", "per_week": 3},
    "ComputerLab": {"teachers": ["Dr. Gupta", "Prof. Mehta"], "room_type": "Lab", "per_week": 2},
    "English": {"teachers": ["Dr. Verma", "Dr. Gupta", "Dr. Iyer"], "room_type": "Lecture", "per_week": 2},
    "Biology": {"teachers": ["Prof. Singh", "Dr. Iyer"], "room_type": "Lecture", "per_week": 2},
    "History": {"teachers": ["Dr. Kapoor"], "room_type": "Lecture", "per_week": 2},
    "Geography": {"teachers": ["Dr. Kapoor"], "room_type": "Lecture", "per_week": 2}
}

batch_subjects = {
    "Batch1": {"Math": 4, "Physics": 3, "English": 2},
    "Batch2": {"Math": 3, "Chemistry": 3, "Biology": 2},
    "Batch3": {"Physics": 2, "Chemistry": 3, "ComputerLab": 1},
    "Batch4": {"Math": 3, "English": 2, "Biology": 2},
    "Batch5": {"History": 2, "Geography": 2},
    "Batch6": {"Math": 3, "Physics": 2, "Chemistry": 2},
    "Batch7": {"English": 2, "Biology": 3, "History": 2},
    "Batch8": {"ComputerLab": 1, "Physics": 3, "Geography": 2},
    "Batch9": {"Math": 3, "Chemistry": 3, "History": 2},
    "Batch10": {"Physics": 3, "Biology": 2, "English": 2},
    "Batch11": {"Math": 2, "Chemistry": 2, "ComputerLab": 1},
    "Batch12": {"History": 3, "English": 2, "Geography": 2}
}

fixed_groups = {
    "Math": [("Batch1", "Batch2"), ("Batch4", "Batch6"), ("Batch9", "Batch11")],
    "Biology": [("Batch2", "Batch4", "Batch7", "Batch10")],
    # Add singleton groups for normally batch-wise subjects
    "Physics": [("Batch1",), ("Batch3",), ("Batch6",), ("Batch8",), ("Batch10",)],
    "Chemistry": [("Batch2",), ("Batch3",), ("Batch6",), ("Batch9",), ("Batch11",)],
    "English": [("Batch1",), ("Batch4",), ("Batch7",), ("Batch10",), ("Batch12",)],
    "ComputerLab": [("Batch3",), ("Batch8",), ("Batch11",)],
    "History": [("Batch5",), ("Batch7",), ("Batch9",), ("Batch12",)],
    "Geography": [("Batch5",), ("Batch8",), ("Batch12",)]
}

# Variables
x = {}
group_x = {}

for s in fixed_groups:
    for group in fixed_groups[s]:
        for t in timeslots:
            for r in rooms:
                for teacher in subjects[s]["teachers"]:
                    group_x[group, s, t, r, teacher] = model.NewBoolVar(f"group_x_{group}_{s}_{t}_{r}_{teacher}")
                    for b in group:
                        x[b, s, t, r, teacher] = group_x[group, s, t, r, teacher]  # Link to batch

# Each subject must be assigned required number of times per batch:
for s in fixed_groups:
    for group in fixed_groups[s]:
        per_week = subjects[s]["per_week"]
        model.Add(
            sum(
                group_x[group, s, t, r, teacher]
                for t in timeslots
                for r in rooms
                for teacher in subjects[s]["teachers"]
            ) == per_week
        )

# Teacher availability constraint:
for b in batches:
    for s in batch_subjects[b]:
        for t in timeslots:
            for r in rooms:
                for teacher in subjects[s]["teachers"]:
                    if t not in teachers[teacher]["available_shifts"]:
                        model.Add(x[b, s, t, r, teacher] == 0)

# Room type constraint:
for b in batches:
    for s in batch_subjects[b]:
        for t in timeslots:
            for r, r_type in rooms.items():
                for teacher in subjects[s]["teachers"]:
                    if r_type != subjects[s]["room_type"]:
                        model.Add(x[b, s, t, r, teacher] == 0)

# No teacher can be in two places at once:
for teacher in teachers:
    for t in timeslots:
        model.Add(
            sum(
                group_x[group, s, t, r, teacher]
                for s in fixed_groups
                for group in fixed_groups[s]
                for r in rooms
                if teacher in subjects[s]["teachers"]
            ) <= 1
        )

# No room clash (same room, same time):
for r in rooms:
    for t in timeslots:
        model.Add(
            sum(
                group_x[group, s, t, r, teacher]
                for s in fixed_groups
                for group in fixed_groups[s]
                for teacher in subjects[s]["teachers"]
            ) <= 1
        )

# No batch can have two classes at once:
for b in batches:
    for t in timeslots:
        model.Add(
            sum(
                x[b, s, t, r, teacher]
                for s in batch_subjects[b]
                for r in rooms
                for teacher in subjects[s]["teachers"]
            ) <= 1
        )


# Auxiliary variables: Which teacher teaches subject s for a batch/group
y = {}

for s in fixed_groups:
    for group in fixed_groups[s]:
        for teacher in subjects[s]["teachers"]:
            y[group, s, teacher] = model.NewBoolVar(f"y_{group}_{s}_{teacher}")

# Constraint 1: Exactly one teacher per batch/group-subject
for s in fixed_groups:
    for group in fixed_groups[s]:
        model.Add(
            sum(y[group, s, teacher] for teacher in subjects[s]["teachers"]) == 1
        )

# Constraint 2: Link x and y
for s in fixed_groups:
    for group in fixed_groups[s]:
        for t in timeslots:
            for r in rooms:
                for teacher in subjects[s]["teachers"]:
                    # The assignment x[b,s,t,r,teacher] is allowed only if y[b,s,teacher] == 1
                    model.Add(group_x[group, s, t, r, teacher] <= y[group, s, teacher])


start_time = time.time()
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 60
solver.parameters.num_search_workers = 2
status = solver.Solve(model)
end_time = time.time()

elapsed_time = end_time - start_time

print(f"\nTime taken to solve the timetable: {elapsed_time:.2f} seconds\n")

if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
    for b in batches:
        for s in batch_subjects[b]:
            for t in timeslots:
                for r in rooms:
                  for teacher in subjects[s]["teachers"]:
                    if solver.Value(x[b, s, t, r, teacher]) == 1:
                        print(f"{b} attends Subject {s} at Timeslot {t} in Room {r} with Teacher {teacher}")
        print('\n')
else:
    print('No feasible solution found.')

t_end_time = time.time()
print(f"\nTotal time taken to run the program: {t_end_time - t_start_time:.2f} seconds\n")