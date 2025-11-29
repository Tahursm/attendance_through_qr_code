import re
from datetime import datetime


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate phone number format (10 digits)"""
    if not phone:
        return True  # Phone is optional
    pattern = r'^\d{10}$'
    return re.match(pattern, phone) is not None


def validate_student_id(student_id):
    """Validate student ID format"""
    if not student_id or len(student_id) < 5:
        return False
    return True


def validate_teacher_id(teacher_id):
    """Validate teacher ID format"""
    if not teacher_id or len(teacher_id) < 5:
        return False
    return True


def validate_password(password):
    """
    Validate password strength
    At least 8 characters, one uppercase, one lowercase, one digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, "Valid"


def validate_registration_data(data, user_type):
    """Validate registration form data"""
    errors = []
    
    # Common validations
    if not data.get('email'):
        errors.append("Email is required")
    elif not validate_email(data['email']):
        errors.append("Invalid email format")
    
    if not data.get('password'):
        errors.append("Password is required")
    else:
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            errors.append(message)
    
    if not data.get('full_name'):
        errors.append("Full name is required")
    
    if not data.get('branch'):
        errors.append("Branch is required")
    
    # User type specific validations
    if user_type == 'student':
        if not data.get('student_id'):
            errors.append("Student ID is required")
        elif not validate_student_id(data['student_id']):
            errors.append("Invalid student ID format")
        
        if not data.get('semester'):
            errors.append("Semester is required")
        
        if not data.get('year'):
            errors.append("Year is required")
    
    elif user_type == 'teacher':
        if not data.get('teacher_id'):
            errors.append("Teacher ID is required")
        elif not validate_teacher_id(data['teacher_id']):
            errors.append("Invalid teacher ID format")
    
    return errors

