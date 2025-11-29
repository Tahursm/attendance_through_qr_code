import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import Config


def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def generate_token(user_id, user_type):
    """
    Generate JWT token for authenticated user
    user_type: 'student' or 'teacher'
    """
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRY_HOURS),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token


def decode_token(token):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(user_type=None):
    """
    Decorator to protect routes that require authentication
    user_type: 'student', 'teacher', or None (any authenticated user)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            
            # Get token from header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(' ')[1]  # Bearer <token>
                except IndexError:
                    return jsonify({'error': 'Invalid token format'}), 401
            
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            
            # Decode and verify token
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Token is invalid or expired'}), 401
            
            # Check user type if specified
            if user_type and payload.get('user_type') != user_type:
                return jsonify({'error': 'Unauthorized access'}), 403
            
            # Pass user info to route
            return f(payload, *args, **kwargs)
        
        return decorated_function
    return decorator

