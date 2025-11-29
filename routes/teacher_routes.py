from flask import Blueprint, request, jsonify
from models import db, Teacher, Session, Attendance, Student, LessonPlan, WiFiNetwork
from utils.auth import verify_password, generate_token, token_required
from datetime import datetime, date, time
from sqlalchemy import func

teacher_bp = Blueprint('teacher', __name__)


@teacher_bp.route('/login', methods=['POST'])
def login_teacher():
    """Teacher login"""
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find teacher
        teacher = Teacher.query.filter_by(email=email).first()
        
        if not teacher or not verify_password(password, teacher.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(teacher.id, 'teacher')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'teacher': teacher.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@teacher_bp.route('/profile', methods=['GET'])
@token_required('teacher')
def get_teacher_profile(current_user):
    """Get teacher profile"""
    try:
        teacher = Teacher.query.get(current_user['user_id'])
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        return jsonify({'teacher': teacher.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch profile: {str(e)}'}), 500


@teacher_bp.route('/sessions', methods=['GET'])
@token_required('teacher')
def get_teacher_sessions(current_user):
    """Get all sessions for teacher"""
    try:
        teacher_id = current_user['user_id']
        
        sessions = Session.query.filter_by(teacher_id=teacher_id).order_by(
            Session.session_date.desc()
        ).all()
        
        sessions_data = []
        for session in sessions:
            sessions_data.append(session.to_dict())
        
        return jsonify({'sessions': sessions_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch sessions: {str(e)}'}), 500


@teacher_bp.route('/session/<int:session_id>/attendance', methods=['GET'])
@token_required('teacher')
def get_session_attendance(current_user, session_id):
    """Get attendance for a specific session"""
    try:
        teacher_id = current_user['user_id']
        
        # Verify session belongs to teacher
        session = Session.query.filter_by(id=session_id, teacher_id=teacher_id).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Get attendance records with student details
        attendance_records = db.session.query(
            Attendance, Student
        ).join(
            Student, Attendance.student_id == Student.id
        ).filter(
            Attendance.session_id == session_id
        ).all()
        
        attendance_data = []
        for att, student in attendance_records:
            attendance_data.append({
                'attendance_id': att.id,
                'student_id': student.student_id,
                'student_name': student.full_name,
                'status': att.status,
                'marked_at': att.marked_at.isoformat() if att.marked_at else None
            })
        
        return jsonify({
            'session': session.to_dict(),
            'attendance': attendance_data,
            'total_present': len([a for a in attendance_data if a['status'] == 'Present'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch attendance: {str(e)}'}), 500


@teacher_bp.route('/lesson-plans', methods=['GET', 'POST'])
@token_required('teacher')
def manage_lesson_plans(current_user):
    """Get or create lesson plans"""
    try:
        teacher_id = current_user['user_id']
        
        if request.method == 'GET':
            # Get all lesson plans for teacher
            lesson_plans = LessonPlan.query.filter_by(teacher_id=teacher_id).order_by(
                LessonPlan.lesson_date.desc()
            ).all()
            
            plans_data = [plan.to_dict() for plan in lesson_plans]
            return jsonify({'lesson_plans': plans_data}), 200
            
        elif request.method == 'POST':
            # Create new lesson plan
            data = request.get_json()
            
            new_plan = LessonPlan(
                teacher_id=teacher_id,
                subject=data['subject'],
                topic=data['topic'],
                branch=data['branch'],
                semester=data['semester'],
                lesson_date=datetime.strptime(data['lesson_date'], '%Y-%m-%d').date(),
                duration_minutes=data.get('duration_minutes'),
                objectives=data.get('objectives'),
                content=data.get('content'),
                resources=data.get('resources')
            )
            
            db.session.add(new_plan)
            db.session.commit()
            
            return jsonify({
                'message': 'Lesson plan created successfully',
                'lesson_plan': new_plan.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to manage lesson plans: {str(e)}'}), 500


@teacher_bp.route('/dashboard/stats', methods=['GET'])
@token_required('teacher')
def get_teacher_dashboard_stats(current_user):
    """Get teacher dashboard statistics"""
    try:
        teacher_id = current_user['user_id']
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        # Get total sessions
        total_sessions = Session.query.filter_by(teacher_id=teacher_id).count()
        
        # Get active sessions
        active_sessions = Session.query.filter_by(
            teacher_id=teacher_id,
            is_active=True
        ).count()
        
        # Get session statistics
        session_stats = db.session.query(
            Session.subject,
            func.count(Session.id).label('total_sessions'),
            func.sum(Session.present_count).label('total_present'),
            func.sum(Session.total_students).label('total_students')
        ).filter(
            Session.teacher_id == teacher_id
        ).group_by(
            Session.subject
        ).all()
        
        subject_stats = []
        for subject, sessions, present, total in session_stats:
            attendance_rate = (present / total * 100) if total and total > 0 else 0
            subject_stats.append({
                'subject': subject,
                'total_sessions': sessions,
                'attendance_rate': round(attendance_rate, 2)
            })
        
        # Get recent sessions
        recent_sessions = Session.query.filter_by(
            teacher_id=teacher_id
        ).order_by(
            Session.session_date.desc()
        ).limit(5).all()
        
        recent_sessions_data = [session.to_dict() for session in recent_sessions]
        
        return jsonify({
            'profile': teacher.to_dict(),
            'statistics': {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions
            },
            'subject_stats': subject_stats,
            'recent_sessions': recent_sessions_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch dashboard stats: {str(e)}'}), 500


@teacher_bp.route('/wifi-networks', methods=['GET', 'POST'])
@token_required('teacher')
def manage_wifi_networks(current_user):
    """Get or create WiFi networks for attendance authentication"""
    try:
        teacher_id = current_user['user_id']
        
        if request.method == 'GET':
            # Get all WiFi networks
            wifi_networks = WiFiNetwork.query.filter_by(is_active=True).order_by(
                WiFiNetwork.created_at.desc()
            ).all()
            
            networks_data = [network.to_dict() for network in wifi_networks]
            return jsonify({'wifi_networks': networks_data}), 200
            
        elif request.method == 'POST':
            # Create new WiFi network
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['ssid', 'location', 'branch']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Check if SSID already exists
            existing_network = WiFiNetwork.query.filter_by(ssid=data['ssid']).first()
            if existing_network:
                return jsonify({'error': 'WiFi network with this SSID already exists'}), 400
            
            new_network = WiFiNetwork(
                ssid=data['ssid'],
                bssid=data.get('bssid'),
                location=data['location'],
                branch=data['branch'],
                room_number=data.get('room_number'),
                is_active=True,
                created_by=teacher_id
            )
            
            db.session.add(new_network)
            db.session.commit()
            
            return jsonify({
                'message': 'WiFi network added successfully',
                'wifi_network': new_network.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to manage WiFi networks: {str(e)}'}), 500


@teacher_bp.route('/wifi-networks/<int:network_id>', methods=['PUT', 'DELETE'])
@token_required('teacher')
def update_delete_wifi_network(current_user, network_id):
    """Update or delete a WiFi network"""
    try:
        teacher_id = current_user['user_id']
        
        # Get the WiFi network
        wifi_network = WiFiNetwork.query.get(network_id)
        
        if not wifi_network:
            return jsonify({'error': 'WiFi network not found'}), 404
        
        if request.method == 'PUT':
            # Update WiFi network
            data = request.get_json()
            
            if 'ssid' in data:
                wifi_network.ssid = data['ssid']
            if 'bssid' in data:
                wifi_network.bssid = data['bssid']
            if 'location' in data:
                wifi_network.location = data['location']
            if 'branch' in data:
                wifi_network.branch = data['branch']
            if 'room_number' in data:
                wifi_network.room_number = data['room_number']
            if 'is_active' in data:
                wifi_network.is_active = data['is_active']
            
            db.session.commit()
            
            return jsonify({
                'message': 'WiFi network updated successfully',
                'wifi_network': wifi_network.to_dict()
            }), 200
            
        elif request.method == 'DELETE':
            # Soft delete by setting is_active to False
            wifi_network.is_active = False
            db.session.commit()
            
            return jsonify({
                'message': 'WiFi network deleted successfully'
            }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update/delete WiFi network: {str(e)}'}), 500


@teacher_bp.route('/wifi-networks/branch/<branch>', methods=['GET'])
@token_required('teacher')
def get_wifi_networks_by_branch(current_user, branch):
    """Get WiFi networks by branch"""
    try:
        wifi_networks = WiFiNetwork.query.filter_by(
            branch=branch,
            is_active=True
        ).all()
        
        networks_data = [network.to_dict() for network in wifi_networks]
        
        return jsonify({'wifi_networks': networks_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch WiFi networks: {str(e)}'}), 500

