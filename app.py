from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from config import config
from models import db
from sqlalchemy import text
import os
import ssl

# Import blueprints
from routes.student_routes import student_bp
from routes.teacher_routes import teacher_bp
from routes.attendance_routes import attendance_bp


def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__, static_folder='static', static_url_path='')
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Disable caching for static files in development
    if config_name == 'development':
        @app.after_request
        def add_no_cache_header(response):
            if request.endpoint and 'static' in request.endpoint:
                response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                response.headers['Pragma'] = 'no-cache'
                response.headers['Expires'] = '0'
            return response
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint that tests database connectivity"""
        try:
            # Test database connection
            db.session.execute(text('SELECT 1'))
            db_status = 'connected'
            db_error = None
        except Exception as e:
            db_status = 'disconnected'
            db_error = str(e)
        
        if db_status == 'connected':
            return jsonify({
                'status': 'healthy',
                'message': 'API is running',
                'database': 'connected'
            }), 200
        else:
            return jsonify({
                'status': 'unhealthy',
                'message': 'API is running but database is not accessible',
                'database': 'disconnected',
                'error': db_error
            }), 503
    
    # Serve frontend pages
    @app.route('/')
    def index():
        return send_from_directory('static', 'index.html')
    
    @app.route('/student/dashboard')
    def student_dashboard():
        return send_from_directory('static', 'student_dashboard.html')
    
    @app.route('/teacher/dashboard')
    def teacher_dashboard():
        return send_from_directory('static', 'teacher_dashboard.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app


def create_ssl_context():
    """Create SSL context for HTTPS"""
    try:
        # Try to create SSL context with adhoc certificate
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('adhoc')
        return context
    except Exception as e:
        print(f"Warning: Could not create SSL context: {e}")
        print("Falling back to HTTP mode")
        return None


# Create app instance for gunicorn and production deployment
try:
    config_name = os.getenv('FLASK_ENV', 'production')
    app = create_app(config_name)
    
    # Initialize database tables on startup
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Warning: Error creating tables: {e}")
            print("App will continue without database initialization")
except Exception as e:
    print(f"FATAL ERROR: Failed to create app: {e}")
    import traceback
    traceback.print_exc()
    # Create a minimal app so gunicorn doesn't fail completely
    app = Flask(__name__)
    @app.route('/')
    def error():
        return jsonify({'error': 'Application initialization failed', 'details': str(e)}), 500

if __name__ == '__main__':
    # Check if SSL is enabled
    ssl_enabled = app.config.get('SSL_ENABLED', False)
    ssl_context = None
    
    if ssl_enabled:
        print("🔒 SSL/HTTPS mode enabled")
        ssl_context = create_ssl_context()
        
        if ssl_context:
            print("✅ HTTPS server starting...")
            print("🌐 Access via: https://your-ip:5000")
        else:
            print("⚠️ SSL context creation failed, falling back to HTTP")
    else:
        print("🔓 HTTP mode (development)")
        print("💡 To enable HTTPS: Set SSL_ENABLED=true in .env")
    
    # Run the application
    try:
        if ssl_context:
            app.run(debug=True, host='0.0.0.0', port=5000, ssl_context=ssl_context)
        else:
            app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Trying HTTP mode...")
        app.run(debug=True, host='0.0.0.0', port=5000)

