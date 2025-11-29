"""
Audit Logging Utility for Security Events
Tracks all security-related events and authentication attempts
"""
import json
from datetime import datetime
from models import db, AuditLog
from flask import request


def log_security_event(event_type, user_id=None, user_type=None, session_id=None, 
                      details=None, success=True, failure_reason=None):
    """
    Log security events to audit trail
    
    Args:
        event_type: Type of security event
        user_id: ID of user involved
        user_type: Type of user (student/teacher)
        session_id: Session ID if applicable
        details: Additional event details (dict)
        success: Whether the event was successful
        failure_reason: Reason for failure if unsuccessful
    """
    try:
        # Get request information
        ip_address = request.remote_addr if request else None
        user_agent = request.headers.get('User-Agent') if request else None
        
        # Create audit log entry
        audit_entry = AuditLog(
            event_type=event_type,
            user_id=user_id,
            user_type=user_type,
            session_id=session_id,
            details=json.dumps(details) if details else None,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason
        )
        
        db.session.add(audit_entry)
        db.session.commit()
        
        return audit_entry.id
        
    except Exception as e:
        # If logging fails, we don't want to break the main flow
        print(f"Audit logging failed: {str(e)}")
        return None


def log_qr_generation(teacher_id, session_id, qr_token, expires_at):
    """Log QR code generation event"""
    details = {
        'qr_token': qr_token[:16] + '...',  # Partial token for security
        'expires_at': expires_at.isoformat() if expires_at else None,
        'generated_at': datetime.utcnow().isoformat()
    }
    
    return log_security_event(
        event_type='QR_GENERATED',
        user_id=teacher_id,
        user_type='teacher',
        session_id=session_id,
        details=details,
        success=True
    )


def log_qr_scan(student_id, session_id, qr_data, success=True, failure_reason=None):
    """Log QR code scan event"""
    details = {
        'qr_data_received': bool(qr_data),
        'scan_time': datetime.utcnow().isoformat()
    }
    
    return log_security_event(
        event_type='QR_SCANNED',
        user_id=student_id,
        user_type='student',
        session_id=session_id,
        details=details,
        success=success,
        failure_reason=failure_reason
    )


def log_attendance_marking(student_id, session_id, success=True, failure_reason=None):
    """Log attendance marking event"""
    details = {
        'marked_at': datetime.utcnow().isoformat(),
        'attendance_status': 'Present' if success else 'Failed'
    }
    
    return log_security_event(
        event_type='ATTENDANCE_MARKED',
        user_id=student_id,
        user_type='student',
        session_id=session_id,
        details=details,
        success=success,
        failure_reason=failure_reason
    )


def log_wifi_verification(student_id, session_id, wifi_ssid, success=True, failure_reason=None):
    """Log WiFi verification event"""
    details = {
        'wifi_ssid': wifi_ssid,
        'verification_time': datetime.utcnow().isoformat()
    }
    
    return log_security_event(
        event_type='WIFI_VERIFIED' if success else 'WIFI_FAILED',
        user_id=student_id,
        user_type='student',
        session_id=session_id,
        details=details,
        success=success,
        failure_reason=failure_reason
    )


def log_unauthorized_access(user_id, user_type, session_id, details=None):
    """Log unauthorized access attempts"""
    return log_security_event(
        event_type='UNAUTHORIZED_ACCESS',
        user_id=user_id,
        user_type=user_type,
        session_id=session_id,
        details=details,
        success=False,
        failure_reason='Unauthorized access attempt'
    )


def get_audit_logs(user_id=None, session_id=None, event_type=None, limit=100):
    """
    Retrieve audit logs with filtering
    
    Args:
        user_id: Filter by user ID
        session_id: Filter by session ID
        event_type: Filter by event type
        limit: Maximum number of records to return
    
    Returns:
        list: Audit log entries
    """
    try:
        query = AuditLog.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        if session_id:
            query = query.filter_by(session_id=session_id)
        if event_type:
            query = query.filter_by(event_type=event_type)
        
        logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
        
        return [log.to_dict() for log in logs]
        
    except Exception as e:
        print(f"Failed to retrieve audit logs: {str(e)}")
        return []


def get_security_summary(session_id=None, hours=24):
    """
    Get security summary for a session or time period
    
    Args:
        session_id: Session ID to analyze
        hours: Number of hours to look back
    
    Returns:
        dict: Security summary statistics
    """
    try:
        from datetime import timedelta
        
        # Calculate time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        # Base query
        query = AuditLog.query.filter(AuditLog.created_at >= time_threshold)
        
        if session_id:
            query = query.filter_by(session_id=session_id)
        
        # Get all logs
        logs = query.all()
        
        # Calculate statistics
        total_events = len(logs)
        successful_events = len([log for log in logs if log.success])
        failed_events = total_events - successful_events
        
        # Event type breakdown
        event_types = {}
        for log in logs:
            event_type = log.event_type
            if event_type not in event_types:
                event_types[event_type] = {'total': 0, 'successful': 0, 'failed': 0}
            event_types[event_type]['total'] += 1
            if log.success:
                event_types[event_type]['successful'] += 1
            else:
                event_types[event_type]['failed'] += 1
        
        # Security alerts
        security_alerts = []
        if failed_events > total_events * 0.1:  # More than 10% failure rate
            security_alerts.append("High failure rate detected")
        
        unauthorized_access = len([log for log in logs if log.event_type == 'UNAUTHORIZED_ACCESS'])
        if unauthorized_access > 0:
            security_alerts.append(f"{unauthorized_access} unauthorized access attempts")
        
        return {
            'total_events': total_events,
            'successful_events': successful_events,
            'failed_events': failed_events,
            'success_rate': (successful_events / total_events * 100) if total_events > 0 else 0,
            'event_types': event_types,
            'security_alerts': security_alerts,
            'time_period_hours': hours,
            'generated_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Failed to generate security summary: {str(e)}")
        return {
            'error': str(e),
            'generated_at': datetime.utcnow().isoformat()
        }
