from flask import Blueprint, request, jsonify
from models import db, Student, Attendance, Session
from utils.auth import hash_password, verify_password, generate_token, token_required
from utils.validators import validate_registration_data, validate_email
from utils.audit_logger import log_security_event
from sqlalchemy import func, case
from datetime import datetime

student_bp = Blueprint('student', __name__)


@student_bp.route('/register', methods=['POST'])
def register_student():
    """Register a new student"""
    try:
        data = request.get_json()
        
        # Validate input data
        errors = validate_registration_data(data, 'student')
        if errors:
            return jsonify({'error': ', '.join(errors)}), 400
        
        # Check if student already exists
        existing_student = Student.query.filter(
            (Student.email == data['email']) | 
            (Student.student_id == data['student_id'])
        ).first()
        
        if existing_student:
            return jsonify({'error': 'Student with this email or student ID already exists'}), 400
        
        # Create new student
        hashed_password = hash_password(data['password'])
        
        new_student = Student(
            student_id=data['student_id'],
            email=data['email'],
            password_hash=hashed_password,
            full_name=data['full_name'],
            branch=data['branch'],
            semester=data['semester'],
            year=data['year'],
            phone=data.get('phone'),
            address=data.get('address'),
            gender=data.get('gender'),
            admission_date=datetime.strptime(data['admission_date'], '%Y-%m-%d').date() if data.get('admission_date') else None,
            total_fee=data.get('total_fee', 0),
            paid_fee=data.get('paid_fee', 0),
            fee_status=data.get('fee_status', 'Pending')
        )
        
        db.session.add(new_student)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_student.id, 'student')
        
        return jsonify({
            'message': 'Student registered successfully',
            'token': token,
            'student': new_student.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@student_bp.route('/login', methods=['POST'])
def login_student():
    """Student login"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find student
        student = Student.query.filter_by(email=email).first()
        
        if not student:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not student.password_hash:
            return jsonify({'error': 'Account error: No password set'}), 401
        
        # Verify password
        if not verify_password(password, student.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(student.id, 'student')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Student login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@student_bp.route('/profile', methods=['GET'])
@token_required('student')
def get_student_profile(current_user):
    """Get student profile"""
    try:
        student = Student.query.get(current_user['user_id'])
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        return jsonify({'student': student.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch profile: {str(e)}'}), 500


@student_bp.route('/attendance', methods=['GET'])
@token_required('student')
def get_student_attendance(current_user):
    """Get student attendance records"""
    try:
        student_id = current_user['user_id']
        
        # Get all attendance records for student
        attendance_records = db.session.query(
            Attendance, Session
        ).join(
            Session, Attendance.session_id == Session.id
        ).filter(
            Attendance.student_id == student_id
        ).order_by(
            Session.session_date.desc()
        ).all()
        
        # Format attendance data
        attendance_data = []
        for att, sess in attendance_records:
            attendance_data.append({
                'id': att.id,
                'subject': sess.subject,
                'session_date': sess.session_date.isoformat(),
                'marked_at': att.marked_at.isoformat() if att.marked_at else None,
                'status': att.status
            })
        
        # Calculate attendance statistics
        total_sessions = len(attendance_records)
        present_count = sum(1 for att, _ in attendance_records if att.status == 'Present')
        attendance_percentage = (present_count / total_sessions * 100) if total_sessions > 0 else 0
        
        return jsonify({
            'attendance': attendance_data,
            'statistics': {
                'total_sessions': total_sessions,
                'present': present_count,
                'absent': total_sessions - present_count,
                'percentage': round(attendance_percentage, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch attendance: {str(e)}'}), 500


@student_bp.route('/attendance/subject/<subject>', methods=['GET'])
@token_required('student')
def get_attendance_by_subject(current_user, subject):
    """Get attendance for a specific subject"""
    try:
        student_id = current_user['user_id']
        
        attendance_records = db.session.query(
            Attendance, Session
        ).join(
            Session, Attendance.session_id == Session.id
        ).filter(
            Attendance.student_id == student_id,
            Session.subject == subject
        ).order_by(
            Session.session_date.desc()
        ).all()
        
        attendance_data = []
        for att, sess in attendance_records:
            attendance_data.append({
                'id': att.id,
                'session_date': sess.session_date.isoformat(),
                'marked_at': att.marked_at.isoformat() if att.marked_at else None,
                'status': att.status
            })
        
        return jsonify({'attendance': attendance_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch attendance: {str(e)}'}), 500


@student_bp.route('/dashboard/stats', methods=['GET'])
@token_required('student')
def get_dashboard_stats(current_user):
    """Get student dashboard statistics"""
    try:
        student = Student.query.get(current_user['user_id'])
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Get attendance statistics
        total_attendance = Attendance.query.filter_by(student_id=student.id).count()
        present_count = Attendance.query.filter_by(
            student_id=student.id, 
            status='Present'
        ).count()
        
        attendance_percentage = (present_count / total_attendance * 100) if total_attendance > 0 else 0
        
        # Get subject-wise attendance
        subject_attendance = db.session.query(
            Session.subject,
            func.count(Attendance.id).label('total'),
            func.sum(case((Attendance.status == 'Present', 1), else_=0)).label('present')
        ).join(
            Attendance, Session.id == Attendance.session_id
        ).filter(
            Attendance.student_id == student.id
        ).group_by(
            Session.subject
        ).all()
        
        subject_stats = []
        for subject, total, present in subject_attendance:
            percentage = (present / total * 100) if total > 0 else 0
            subject_stats.append({
                'subject': subject,
                'total_sessions': total,
                'present': present,
                'percentage': round(percentage, 2)
            })
        
        return jsonify({
            'profile': student.to_dict(),
            'attendance': {
                'total_sessions': total_attendance,
                'present': present_count,
                'percentage': round(attendance_percentage, 2)
            },
            'subject_wise_attendance': subject_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch dashboard stats: {str(e)}'}), 500
