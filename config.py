import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'attendance_qr_db')
    DB_PORT = os.getenv('DB_PORT', '3306')
    
    # SQLAlchemy configuration
    # For Vercel/serverless: Use environment variable or MySQL/Postgres
    # SQLite doesn't work on serverless platforms (read-only filesystem)
    if os.getenv('VERCEL') or os.getenv('DATABASE_URL'):
        # On Vercel, prefer DATABASE_URL or MySQL connection
        if os.getenv('DATABASE_URL'):
            SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
        else:
            # Use MySQL connection string from env vars
            SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        # Local development: Use SQLite for quick setup
        SQLALCHEMY_DATABASE_URI = 'sqlite:///attendance.db'
        # For MySQL locally, uncomment below and configure .env:
        # SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # QR Code settings
    QR_TOKEN_EXPIRY = int(os.getenv('QR_TOKEN_EXPIRY', 6))  # seconds
    
    # JWT settings
    JWT_EXPIRY_HOURS = 24
    
    # SSL/HTTPS settings
    SSL_ENABLED = os.getenv('SSL_ENABLED', 'false').lower() == 'true'
    SSL_CERT_PATH = os.getenv('SSL_CERT_PATH', '')
    SSL_KEY_PATH = os.getenv('SSL_KEY_PATH', '')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SSL_ENABLED = True  # Force HTTPS in production


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

