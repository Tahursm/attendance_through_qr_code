from flask import Blueprint, request, jsonify
from models import db, Session, Attendance, Teacher, Student, WiFiNetwork, AuditLog
from utils.auth import token_required
from utils.qr_generator import generate_qr_data, create_qr_code_image, parse_qr_data, validate_qr_token
from utils.audit_logger import (log_qr_generation, log_qr_scan, 
                               log_attendance_marking, log_wifi_verification, log_unauthorized_access)
from datetime import datetime, date, time, timedelta
import secrets
import json

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route('/create-session', methods=['POST'])
@token_required('teacher')
def create_session(current_user):
    """Create a new attendance session"""
    try:
        teacher_id = current_user['user_id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['subject', 'branch', 'semester', 'total_students']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate unique session ID
        session_date_str = date.today().strftime('%Y%m%d')
        random_suffix = secrets.token_hex(4)
        session_id = f"SES{session_date_str}{random_suffix}"
        
        # Create new session
        new_session = Session(
            session_id=session_id,
            teacher_id=teacher_id,
            subject=data['subject'],
            branch=data['branch'],
            semester=data['semester'],
            session_date=date.today(),
            start_time=datetime.now().time(),
            total_students=data['total_students'],
            is_active=True
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session created successfully',
            'session': new_session.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create session: {str(e)}'}), 500


@attendance_bp.route('/generate-qr/<int:session_db_id>', methods=['GET'])
@token_required('teacher')
def generate_qr(current_user, session_db_id):
    """Generate dynamic QR code for attendance"""
    try:
        teacher_id = current_user['user_id']
        
        # Get session and verify it belongs to teacher
        session = Session.query.filter_by(
            id=session_db_id,
            teacher_id=teacher_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if not session.is_active:
            return jsonify({'error': 'Session is not active'}), 400
        
        # Generate new QR data with token
        qr_token, qr_data_json, expires_at = generate_qr_data(
            teacher_id=teacher_id,
            session_id=session.session_id,
            session_db_id=session_db_id
        )
        
        # Update session with new token
        session.qr_token = qr_token
        session.token_generated_at = datetime.utcnow()
        session.token_expires_at = expires_at
        db.session.commit()
        
        # Log QR generation event
        log_qr_generation(teacher_id, session.id, qr_token, expires_at)
        
        # Create QR code image
        qr_image_base64 = create_qr_code_image(qr_data_json)
        
        return jsonify({
            'qr_code': qr_image_base64,
            'qr_data': qr_data_json,
            'expires_at': expires_at.isoformat(),
            'session_id': session.session_id,
            'subject': session.subject,
            'security_features': {
                'encrypted': True,
                'time_limited': True,
                'expires_in_minutes': 3
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to generate QR code: {str(e)}'}), 500


@attendance_bp.route('/mark', methods=['POST'])
@token_required('student')
def mark_attendance(current_user):
    """Enhanced attendance marking with comprehensive security validation"""
    try:
        student_id = current_user['user_id']
        data = request.get_json()
        
        # ========== STEP 1: QR CODE VALIDATION ==========
        if not data.get('qr_data'):
            log_qr_scan(student_id, None, None, success=False, failure_reason="No QR data provided")
            return jsonify({'error': 'QR data is required'}), 400
        
        # Parse and validate QR data with enhanced security
        qr_data = parse_qr_data(data['qr_data'])
        if not qr_data:
            log_qr_scan(student_id, None, None, success=False, failure_reason="Invalid QR format")
            return jsonify({'error': 'Invalid QR code format'}), 400
        
        # Get session
        session = Session.query.get(qr_data['session_db_id'])
        if not session:
            log_qr_scan(student_id, None, None, success=False, failure_reason="Session not found")
            return jsonify({'error': 'Session not found'}), 404
        
        # Enhanced QR validation with signature verification
        is_valid, error_msg, validated_qr_data = validate_qr_token(
            data['qr_data'], 
            session.qr_token, 
            session.token_expires_at
        )
        
        if not is_valid:
            log_qr_scan(student_id, session.id, data['qr_data'], success=False, failure_reason=error_msg)
            return jsonify({'error': error_msg}), 400
        
        # Log successful QR scan
        log_qr_scan(student_id, session.id, data['qr_data'], success=True)
        
        # ========== STEP 2: SESSION VALIDATION ==========
        if not session.is_active:
            return jsonify({'error': 'This session is no longer active'}), 400
        
        # Check if attendance already marked
        existing_attendance = Attendance.query.filter_by(
            student_id=student_id,
            session_id=session.id
        ).first()
        
        if existing_attendance:
            return jsonify({'error': 'Attendance already marked for this session'}), 400
        
        # ========== STEP 3: STUDENT VALIDATION ==========
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Validate student is registered for this class
        if student.branch != session.branch:
            log_unauthorized_access(student_id, 'student', session.id, 
                                  {'reason': 'Branch mismatch', 'student_branch': student.branch, 'session_branch': session.branch})
            return jsonify({'error': 'This session is not for your branch'}), 400
        
        if student.semester != session.semester:
            log_unauthorized_access(student_id, 'student', session.id,
                                  {'reason': 'Semester mismatch', 'student_semester': student.semester, 'session_semester': session.semester})
            return jsonify({'error': 'This session is not for your semester'}), 400
        
        # ========== STEP 4: WIFI AUTHENTICATION ==========
        wifi_ssid = data.get('wifi_ssid')
        if not wifi_ssid:
            log_wifi_verification(student_id, session.id, None, success=False, 
                                failure_reason="No WiFi SSID provided")
            return jsonify({
                'error': 'WiFi authentication required',
                'details': 'You must be connected to an authorized classroom WiFi network'
            }), 403
        
        # Check if the WiFi SSID is authorized for this branch
        authorized_network = WiFiNetwork.query.filter_by(
            ssid=wifi_ssid,
            branch=session.branch,
            is_active=True
        ).first()
        
        if not authorized_network:
            log_wifi_verification(student_id, session.id, wifi_ssid, success=False,
                                failure_reason="Unauthorized WiFi network")
            return jsonify({
                'error': 'Unauthorized WiFi network',
                'details': f'Please connect to an authorized classroom WiFi network for {session.branch} branch',
                'connected_ssid': wifi_ssid
            }), 403
        
        # Log successful WiFi verification
        log_wifi_verification(student_id, session.id, wifi_ssid, success=True)
        
        # ========== STEP 5: MARK ATTENDANCE ==========
        new_attendance = Attendance(
            student_id=student_id,
            session_id=session.id,
            teacher_id=session.teacher_id,
            status='Present',
            ip_address=request.remote_addr,
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        
        db.session.add(new_attendance)
        session.present_count += 1
        db.session.commit()
        
        # Log successful attendance marking
        log_attendance_marking(student_id, session.id, success=True)
        
        response_payload = {
            'message': 'Attendance marked successfully',
            'attendance': new_attendance.to_dict(),
            'session': {
                'subject': session.subject,
                'date': session.session_date.isoformat()
            },
            'security_verified': {
                'qr_code': True,
                'wifi': True,
                'student_registration': True
            },
            'wifi_location': authorized_network.location
        }
        
        return jsonify(response_payload), 200
        
    except Exception as e:
        db.session.rollback()
        log_attendance_marking(student_id if 'student_id' in locals() else None, 
                              session.id if 'session' in locals() else None, 
                              success=False, failure_reason=str(e))
        return jsonify({'error': f'Failed to mark attendance: {str(e)}'}), 500


@attendance_bp.route('/session/<int:session_db_id>/end', methods=['POST'])
@token_required('teacher')
def end_session(current_user, session_db_id):
    """End an active session"""
    try:
        teacher_id = current_user['user_id']
        
        # Get session and verify ownership
        session = Session.query.filter_by(
            id=session_db_id,
            teacher_id=teacher_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # End session
        session.is_active = False
        session.end_time = datetime.now().time()
        session.qr_token = None  # Invalidate token
        
        db.session.commit()
        
        return jsonify({
            'message': 'Session ended successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to end session: {str(e)}'}), 500


@attendance_bp.route('/session/<int:session_db_id>/stats', methods=['GET'])
@token_required('teacher')
def get_session_stats(current_user, session_db_id):
    """Get real-time attendance statistics for a session"""
    try:
        teacher_id = current_user['user_id']
        
        # Get session and verify ownership
        session = Session.query.filter_by(
            id=session_db_id,
            teacher_id=teacher_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Get attendance count
        present_count = Attendance.query.filter_by(
            session_id=session.id,
            status='Present'
        ).count()
        
        attendance_percentage = (present_count / session.total_students * 100) if session.total_students > 0 else 0
        
        return jsonify({
            'session': session.to_dict(),
            'present_count': present_count,
            'total_students': session.total_students,
            'attendance_percentage': round(attendance_percentage, 2),
            'is_active': session.is_active
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch session stats: {str(e)}'}), 500


@attendance_bp.route('/report', methods=['GET'])
@token_required('teacher')
def get_attendance_report(current_user):
    """Get attendance report for teacher"""
    try:
        teacher_id = current_user['user_id']
        
        # Get query parameters
        session_id = request.args.get('session_id', type=int)
        branch = request.args.get('branch')
        subject = request.args.get('subject')
        
        # Base query
        query = db.session.query(
            Session, Attendance, Student
        ).join(
            Attendance, Session.id == Attendance.session_id
        ).join(
            Student, Attendance.student_id == Student.id
        ).filter(
            Session.teacher_id == teacher_id
        )
        
        # Apply filters
        if session_id:
            query = query.filter(Session.id == session_id)
        if branch:
            query = query.filter(Session.branch == branch)
        if subject:
            query = query.filter(Session.subject == subject)
        
        results = query.order_by(Session.session_date.desc()).all()
        
        report_data = []
        for session, attendance, student in results:
            report_data.append({
                'session_id': session.session_id,
                'subject': session.subject,
                'session_date': session.session_date.isoformat(),
                'student_id': student.student_id,
                'student_name': student.full_name,
                'branch': student.branch,
                'status': attendance.status,
                'marked_at': attendance.marked_at.isoformat() if attendance.marked_at else None
            })
        
        return jsonify({'report': report_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500


@attendance_bp.route('/audit/logs', methods=['GET'])
@token_required('teacher')
def get_audit_logs(current_user):
    """Get audit logs for security monitoring"""
    try:
        from utils.audit_logger import get_audit_logs, get_security_summary
        
        # Get query parameters
        session_id = request.args.get('session_id', type=int)
        event_type = request.args.get('event_type')
        hours = request.args.get('hours', 24, type=int)
        
        # Get audit logs
        logs = get_audit_logs(
            user_id=current_user['user_id'],
            session_id=session_id,
            event_type=event_type,
            limit=1000
        )
        
        # Get security summary
        summary = get_security_summary(session_id=session_id, hours=hours)
        
        return jsonify({
            'audit_logs': logs,
            'security_summary': summary,
            'total_logs': len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve audit logs: {str(e)}'}), 500


@attendance_bp.route('/security/status', methods=['GET'])
@token_required('teacher')
def get_security_status(current_user):
    """Get current security status and alerts"""
    try:
        from utils.audit_logger import get_security_summary
        
        # Get security summary for last 24 hours
        summary = get_security_summary(hours=24)
        
        # Get recent failed attempts
        recent_failures = AuditLog.query.filter(
            AuditLog.created_at >= datetime.utcnow() - timedelta(hours=1),
            AuditLog.success == False
        ).order_by(AuditLog.created_at.desc()).limit(10).all()
        
        return jsonify({
            'security_status': 'active',
            'summary': summary,
            'recent_failures': [log.to_dict() for log in recent_failures],
            'alerts': summary.get('security_alerts', []),
            'last_updated': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get security status: {str(e)}'}), 500

