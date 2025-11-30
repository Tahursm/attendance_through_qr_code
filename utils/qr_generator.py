import qrcode
import secrets
import string
import json
import base64
import hashlib
import hmac
from io import BytesIO
from datetime import datetime, timedelta
from config import Config


def generate_random_token(length=32):
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_qr_data(teacher_id, session_id, session_db_id):
    """
    Generate QR code data with enhanced security features
    Returns: (qr_token, qr_data, expires_at)
    """
    # Generate unique token
    qr_token = generate_random_token(64)  # Longer token for better security
    
    # Calculate expiry time (from config)
    from config import Config
    token_generated_at = datetime.utcnow()
    expires_at = token_generated_at + timedelta(seconds=Config.QR_TOKEN_EXPIRY)
    
    # Create secure payload with encryption
    payload = {
        'teacher_id': teacher_id,
        'session_id': session_id,
        'session_db_id': session_db_id,
        'timestamp': token_generated_at.isoformat(),
        'expires_at': expires_at.isoformat(),
        'version': '2.0'  # QR code version for compatibility
    }
    
    # Create HMAC signature for integrity
    payload_json = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        Config.SECRET_KEY.encode(),
        payload_json.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Create final QR data with signature
    qr_data = {
        'payload': payload,
        'token': qr_token,
        'signature': signature,
        'checksum': hashlib.sha256((payload_json + qr_token).encode()).hexdigest()[:16]
    }
    
    return qr_token, json.dumps(qr_data), expires_at


def create_qr_code_image(data):
    """
    Create QR code image from data
    Returns: base64 encoded image string
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Add data to QR code
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64 for easy transmission
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"


def validate_qr_token(qr_data_json, stored_token, token_expires_at):
    """
    Validate QR code data and token with enhanced security
    Returns: (is_valid, error_message, qr_data)
    """
    try:
        # Parse QR data
        qr_data = json.loads(qr_data_json)
        
        # Validate structure
        if 'payload' not in qr_data or 'token' not in qr_data or 'signature' not in qr_data:
            return False, "Invalid QR code structure", None
        
        # Check if token matches
        if qr_data.get('token') != stored_token:
            return False, "Invalid QR code token", None
        
        # Verify HMAC signature
        payload = qr_data['payload']
        payload_json = json.dumps(payload, sort_keys=True)
        expected_signature = hmac.new(
            Config.SECRET_KEY.encode(),
            payload_json.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(qr_data['signature'], expected_signature):
            return False, "QR code signature verification failed", None
        
        # Verify checksum
        expected_checksum = hashlib.sha256((payload_json + qr_data['token']).encode()).hexdigest()[:16]
        if not hmac.compare_digest(qr_data.get('checksum', ''), expected_checksum):
            return False, "QR code checksum verification failed", None
        
        # Check if token has expired
        current_time = datetime.utcnow()
        if current_time > token_expires_at:
            return False, "QR code has expired", None
        
        return True, None, qr_data
        
    except json.JSONDecodeError:
        return False, "Invalid QR code format", None
    except Exception as e:
        return False, f"Validation error: {str(e)}", None


def parse_qr_data(qr_data_json):
    """Parse QR code data from JSON string with validation"""
    try:
        qr_data = json.loads(qr_data_json)
        
        # Handle both old and new format
        if 'payload' in qr_data:
            # New encrypted format
            return qr_data['payload']
        else:
            # Legacy format for backward compatibility
            return qr_data
            
    except json.JSONDecodeError:
        return None

