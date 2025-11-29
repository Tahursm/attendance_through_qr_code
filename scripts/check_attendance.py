import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import create_app
from models import Attendance, Student, Session


def main(limit: int = 5):
    app = create_app()
    with app.app_context():
        rows = (
            Attendance.query.order_by(Attendance.id.desc())
            .limit(limit)
            .all()
        )

        if not rows:
            print("No attendance records found.")
            return

        print("ID | Student ID | Email | Session | Subject | Marked at")
        print("-" * 90)

        for row in rows:
            student = Student.query.get(row.student_id)
            session = Session.query.get(row.session_id)
            print(
                f"{row.id} | "
                f"{student.student_id if student else 'N/A'} | "
                f"{student.email if student else 'N/A'} | "
                f"{session.session_id if session else row.session_id} | "
                f"{session.subject if session else 'N/A'} | "
                f"{row.marked_at}"
            )


if __name__ == "__main__":
    main()

