from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Enum

db = SQLAlchemy()


class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(Enum('Male', 'Female', 'Other', name='gender_enum'))
    admission_date = db.Column(db.Date)
    fee_status = db.Column(Enum('Paid', 'Pending', 'Partial', name='fee_status_enum'), default='Pending')
    total_fee = db.Column(db.Numeric(10, 2), default=0.00)
    paid_fee = db.Column(db.Numeric(10, 2), default=0.00)
    backlogs = db.Column(db.Integer, default=0)
    cgpa = db.Column(db.Numeric(3, 2), default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attendance_records = db.relationship('Attendance', backref='student', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'email': self.email,
            'full_name': self.full_name,
            'branch': self.branch,
            'semester': self.semester,
            'year': self.year,
            'phone': self.phone,
            'address': self.address,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'admission_date': self.admission_date.isoformat() if self.admission_date else None,
            'fee_status': self.fee_status,
            'total_fee': float(self.total_fee) if self.total_fee else 0,
            'paid_fee': float(self.paid_fee) if self.paid_fee else 0,
            'backlogs': self.backlogs,
            'cgpa': float(self.cgpa) if self.cgpa else 0,
        }


class Teacher(db.Model):
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    designation = db.Column(db.String(50))
    qualification = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(Enum('Male', 'Female', 'Other', name='teacher_gender_enum'))
    joining_date = db.Column(db.Date)
    experience_years = db.Column(db.Integer, default=0)
    specialization = db.Column(db.String(100))
    achievements = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = db.relationship('Session', backref='teacher', lazy=True)
    lesson_plans = db.relationship('LessonPlan', backref='teacher', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'email': self.email,
            'full_name': self.full_name,
            'branch': self.branch,
            'designation': self.designation,
            'qualification': self.qualification,
            'phone': self.phone,
            'address': self.address,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'experience_years': self.experience_years,
            'specialization': self.specialization,
            'achievements': self.achievements,
        }


class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(50), unique=True, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    session_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time)
    qr_token = db.Column(db.String(100))
    token_generated_at = db.Column(db.DateTime)
    token_expires_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    total_students = db.Column(db.Integer, default=0)
    present_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    attendance_records = db.relationship('Attendance', backref='session', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'teacher_id': self.teacher_id,
            'subject': self.subject,
            'branch': self.branch,
            'semester': self.semester,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_active': self.is_active,
            'total_students': self.total_students,
            'present_count': self.present_count,
        }


class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(Enum('Present', 'Absent', 'Late', name='attendance_status_enum'), default='Present')
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    ip_address = db.Column(db.String(45))
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'session_id': self.session_id,
            'teacher_id': self.teacher_id,
            'marked_at': self.marked_at.isoformat() if self.marked_at else None,
            'status': self.status,
        }


class LessonPlan(db.Model):
    __tablename__ = 'lesson_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    lesson_date = db.Column(db.Date, nullable=False)
    duration_minutes = db.Column(db.Integer)
    objectives = db.Column(db.Text)
    content = db.Column(db.Text)
    resources = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'subject': self.subject,
            'topic': self.topic,
            'branch': self.branch,
            'semester': self.semester,
            'lesson_date': self.lesson_date.isoformat() if self.lesson_date else None,
            'duration_minutes': self.duration_minutes,
            'objectives': self.objectives,
            'content': self.content,
            'resources': self.resources,
        }


class WiFiNetwork(db.Model):
    __tablename__ = 'wifi_networks'
    
    id = db.Column(db.Integer, primary_key=True)
    ssid = db.Column(db.String(100), nullable=False)
    bssid = db.Column(db.String(50))
    location = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    room_number = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ssid': self.ssid,
            'bssid': self.bssid,
            'location': self.location,
            'branch': self.branch,
            'room_number': self.room_number,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(Enum('QR_GENERATED', 'QR_SCANNED', 'ATTENDANCE_MARKED', 'QR_EXPIRED', 'INVALID_QR', 'UNAUTHORIZED_ACCESS',
                              'SESSION_CREATED', 'SESSION_ENDED', 'WIFI_VERIFIED', 'WIFI_FAILED',
                              name='audit_event_enum'), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)  # Can be student or teacher ID
    user_type = db.Column(Enum('student', 'teacher', name='audit_user_type_enum'), nullable=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=True)
    details = db.Column(db.Text)  # JSON string with event details
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    success = db.Column(db.Boolean, default=True)
    failure_reason = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'user_id': self.user_id,
            'user_type': self.user_type,
            'session_id': self.session_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'success': self.success,
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

