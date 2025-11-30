"""Create a teacher account - Run this on Render to create a teacher"""
from app import create_app
from models import db, Teacher
from utils.auth import hash_password
from datetime import date

app = create_app()

with app.app_context():
    # Check if teacher already exists
    email = 'dr.sharma@college.edu'
    existing = Teacher.query.filter_by(email=email).first()
    
    if existing:
        print(f"Teacher with email {email} already exists!")
        print(f"Email: {existing.email}")
        print(f"Name: {existing.full_name}")
    else:
        # Create sample teacher
        teacher = Teacher(
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
        )
        
        db.session.add(teacher)
        db.session.commit()
        
        print("✅ Teacher account created successfully!")
        print(f"Email: {teacher.email}")
        print(f"Password: password123")
        print(f"Name: {teacher.full_name}")

