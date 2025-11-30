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
    """Verify a password against its hash or plain text"""
    if not password_hash:
        return False
    
    # Check if password_hash is a bcrypt hash (starts with $2b$, $2a$, etc.)
    if password_hash.startswith('$2'):
        # It's a bcrypt hash, verify normally
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            print(f"Error verifying bcrypt password: {e}")
            return False
    else:
        # It's plain text, do simple comparison
        return password == password_hash


def generate_token(user_id, user_type):
    """
    Generate JWT token for authenticated user
    user_type: 'student' or 'teacher'
    """
    try:
        # Get secret key from Config class or environment
        secret_key = Config.SECRET_KEY
        if not secret_key or secret_key == 'dev-secret-key-change-in-production':
            # Fallback to environment variable
            import os
            secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
        
        # Get JWT expiry hours
        jwt_expiry = getattr(Config, 'JWT_EXPIRY_HOURS', 24)
        
        payload = {
            'user_id': user_id,
            'user_type': user_type,
            'exp': datetime.utcnow() + timedelta(hours=jwt_expiry),
            'iat': datetime.utcnow()
        }
        
        # Encode token - handle both string and bytes return
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        # PyJWT 2.0+ returns a string, older versions return bytes
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        return token
    except Exception as e:
        print(f"Error generating token: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to generate token: {str(e)}")


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
                return jsonify({
                    'error': 'Token is invalid or expired',
                    'details': 'Please login again to get a new token'
                }), 401
            
            # Check user type if specified
            if user_type and payload.get('user_type') != user_type:
                return jsonify({
                    'error': 'Unauthorized access',
                    'details': f'This endpoint requires {user_type} access, but token is for {payload.get("user_type")}'
                }), 403
            
            # Pass user info to route
            return f(payload, *args, **kwargs)
        
        return decorated_function
    return decorator

