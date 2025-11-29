"""
Vercel serverless function handler for Flask application
This file is the entry point for Vercel to invoke the Flask app
"""
import sys
import os

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

# Create Flask app instance
# Use 'production' config for Vercel deployment
# Vercel sets VERCEL=1 environment variable
config_name = 'production' if os.getenv('VERCEL') else 'development'
app = create_app(config_name)

# Initialize database tables on first import
# This ensures tables exist when the function is invoked
# Note: SQLite won't work well on Vercel - use a managed database service
with app.app_context():
    try:
        from models import db
        # Only create tables if using a proper database (not SQLite on serverless)
        # For Vercel, you should use Vercel Postgres, PlanetScale, or similar
        db.create_all()
    except Exception as e:
        # Log but don't fail - tables might already exist or database might not be configured
        # This is expected on Vercel if using external database
        print(f"Database initialization note: {e}")

# Export the app for Vercel
# Vercel expects a WSGI application object named 'handler' or 'app'
handler = app

