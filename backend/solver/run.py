from solver_engine import run_solver
import json
from collections import defaultdict


def run():
    # -----------------------------
    # Input data
    # -----------------------------
    batches = [f"Batch{i}" for i in range(1, 13)]
    timeslots = 35  # 5 days * 7 shifts

    rooms = {
        "LH1": "Lecture",
        "LH2": "Lecture",
        "LH3": "Lecture",
        "LH4": "Lecture",
        "Lab1": "Lab",
        "Lab2": "Lab",
        "Lab3": "Lab"
    }

    teachers = {
        "Dr. Sharma": {"subjects": ["Math", "Physics"], "available_shifts": list(range(35))},
        "Prof. Singh": {"subjects": ["Chemistry", "Biology"], "available_shifts": list(range(0, 35, 2))},
        "Dr. Gupta": {"subjects": ["ComputerLab", "English"], "available_shifts": list(range(5, 35))},
        "Dr. Verma": {"subjects": ["Math", "Physics", "Chemistry", "English"], "available_shifts": list(range(0, 30))},
        "Dr. Kapoor": {"subjects": ["History", "Geography"], "available_shifts": list(range(0, 35))},
        "Prof. Mehta": {"subjects": ["ComputerLab", "Physics"], "available_shifts": list(range(10, 35))},
        "Dr. Iyer": {"subjects": ["English", "Biology"], "available_shifts": list(range(0, 20))}
    }

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
        "Physics": [("Batch1",), ("Batch3",), ("Batch6",), ("Batch8",), ("Batch10",)],
        "Chemistry": [("Batch2",), ("Batch3",), ("Batch6",), ("Batch9",), ("Batch11",)],
        "English": [("Batch1",), ("Batch4",), ("Batch7",), ("Batch10",), ("Batch12",)],
        "ComputerLab": [("Batch3",), ("Batch8",), ("Batch11",)],
        "History": [("Batch5",), ("Batch7",), ("Batch9",), ("Batch12",)],
        "Geography": [("Batch5",), ("Batch8",), ("Batch12",)]
    }

    solver_input = {
        "batches": batches,
        "timeslots": timeslots,
        "rooms": rooms,
        "teachers": teachers,
        "subjects": subjects,
        "batch_subjects": batch_subjects,
        "fixed_groups": fixed_groups
    }

    # -----------------------------
    # Run solver
    # -----------------------------
    result = run_solver(solver_input)

    # -----------------------------
    # Print output
    # -----------------------------
    print("\n========== SOLVER RESULT ==========")
    print(f"Status      : {result['status']}")
    print(f"Time Taken  : {result['time_taken']} seconds")
    print(f"Message     : {result['message']}\n")

    print("Assignments:")
    for a in result["assignments"]:
        print(
            f"Batch: {a['batch']:<8} | "
            f"Subject: {a['subject']:<12} | "
            f"Timeslot: {a['timeslot']:<2} | "
            f"Room: {a['room']:<4} | "
            f"Teacher: {a['teacher']}"
        )


    print("\n========== BATCH-WISE ASSIGNMENTS ==========\n")

    batch_wise = defaultdict(list)

    # Group assignments by batch
    for a in result["assignments"]:
        batch_wise[a["batch"]].append(a)

    # Print batch-wise
    for batch in sorted(batch_wise.keys()):
        print(f"\n--- {batch} ---")
        for a in sorted(batch_wise[batch], key=lambda x: x["timeslot"]):
            print(
                f"Timeslot: {a['timeslot']:<2} | "
                f"Subject: {a['subject']:<12} | "
                f"Room: {a['room']:<4} | "
                f"Teacher: {a['teacher']}"
            )



if __name__ == "__main__":
    run()
