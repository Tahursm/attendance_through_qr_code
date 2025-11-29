"""Initialize database with sample data"""
from app import create_app
from models import db, Student, Teacher
from utils.auth import hash_password
from datetime import date

app = create_app()

with app.app_context():
    # Drop all tables and recreate
    db.drop_all()
    db.create_all()
    
    print("Creating tables...")
    
    # Create sample students
    students = [
        Student(
            student_id='STU2024001',
            email='john.doe@college.edu',
            password_hash=hash_password('password123'),
            full_name='John Doe',
            branch='Computer Science',
            semester=6,
            year=2024,
            phone='9876543210',
            gender='Male',
            admission_date=date(2021, 8, 1),
            fee_status='Paid',
            total_fee=50000.00,
            paid_fee=50000.00,
            backlogs=0,
            cgpa=8.5
        ),
        Student(
            student_id='STU2024002',
            email='jane.smith@college.edu',
            password_hash=hash_password('password123'),
            full_name='Jane Smith',
            branch='Computer Science',
            semester=6,
            year=2024,
            phone='9876543211',
            gender='Female',
            admission_date=date(2021, 8, 1),
            fee_status='Paid',
            total_fee=50000.00,
            paid_fee=50000.00,
            backlogs=1,
            cgpa=7.8
        ),
        Student(
            student_id='STU2024003',
            email='alex.johnson@college.edu',
            password_hash=hash_password('password123'),
            full_name='Alex Johnson',
            branch='Information Technology',
            semester=4,
            year=2024,
            phone='9876543212',
            gender='Male',
            admission_date=date(2022, 8, 1),
            fee_status='Partial',
            total_fee=50000.00,
            paid_fee=30000.00,
            backlogs=2,
            cgpa=7.2
        ),
        Student(
            student_id='STU2024004',
            email='emily.brown@college.edu',
            password_hash=hash_password('password123'),
            full_name='Emily Brown',
            branch='Electronics',
            semester=2,
            year=2024,
            phone='9876543213',
            gender='Female',
            admission_date=date(2023, 8, 1),
            fee_status='Pending',
            total_fee=50000.00,
            paid_fee=0.00,
            backlogs=0,
            cgpa=8.9
        )
    ]
    
    # Create sample teachers
    teachers = [
        Teacher(
            teacher_id='TCH2024001',
            email='dr.sharma@college.edu',
            password_hash=hash_password('password123'),
            full_name='Dr. Rajesh Sharma',
            branch='Computer Science',
            designation='Professor',
            qualification='Ph.D. in Computer Science',
            phone='9998887770',
            gender='Male',
            joining_date=date(2010, 7, 1),
            experience_years=14,
            specialization='Data Structures and Algorithms'
        ),
        Teacher(
            teacher_id='TCH2024002',
            email='prof.mehta@college.edu',
            password_hash=hash_password('password123'),
            full_name='Prof. Priya Mehta',
            branch='Computer Science',
            designation='Associate Professor',
            qualification='M.Tech in Software Engineering',
            phone='9998887771',
            gender='Female',
            joining_date=date(2015, 8, 1),
            experience_years=9,
            specialization='Database Management Systems'
        ),
        Teacher(
            teacher_id='TCH2024003',
            email='dr.kumar@college.edu',
            password_hash=hash_password('password123'),
            full_name='Dr. Amit Kumar',
            branch='Information Technology',
            designation='Assistant Professor',
            qualification='Ph.D. in Information Technology',
            phone='9998887772',
            gender='Male',
            joining_date=date(2018, 6, 15),
            experience_years=6,
            specialization='Machine Learning'
        )
    ]
    
    # Add all to database
    for student in students:
        db.session.add(student)
    
    for teacher in teachers:
        db.session.add(teacher)
    
    db.session.commit()
    
    print("[OK] Database initialized successfully!")
    print("\nSample Accounts Created:")
    print("\nSTUDENTS (password: password123)")
    for student in students:
        print(f"   - {student.email}")
    
    print("\nTEACHERS (password: password123)")
    for teacher in teachers:
        print(f"   - {teacher.email}")
    
    print("\nRun 'py app.py' to start the server!")

