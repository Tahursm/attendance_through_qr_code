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
    # Check if using PostgreSQL (Render, Railway) or MySQL
    _database_url = os.getenv('DATABASE_URL')
    if _database_url:  # PostgreSQL connection string (Render, Railway)
        # Handle both postgres:// and postgresql:// URLs
        if _database_url.startswith('postgres://'):
            SQLALCHEMY_DATABASE_URI = _database_url.replace('postgres://', 'postgresql://', 1)
        else:
            SQLALCHEMY_DATABASE_URI = _database_url
    elif os.getenv('DB_HOST') and os.getenv('DB_HOST') != 'localhost':
        # MySQL configuration (using .env file)
        SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        # For SQLite (development/testing)
        SQLALCHEMY_DATABASE_URI = 'sqlite:///attendance.db'
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

