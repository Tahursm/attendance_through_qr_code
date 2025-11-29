#!/usr/bin/env python3
"""
HTTPS Setup Script for Phone Fingerprint Support
Run this script to easily enable HTTPS for your attendance system
"""

import os
import sys

def create_env_file():
    """Create .env file with HTTPS enabled"""
    env_content = """# HTTPS Configuration for Phone Fingerprint Support
SSL_ENABLED=true
SECRET_KEY=your_super_secret_key_change_this_in_production

# Database Configuration (update as needed)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendance_qr_db
DB_PORT=3306

# QR Code Settings
QR_TOKEN_EXPIRY=6

# Biometric Settings
BIOMETRIC_ENABLED=true
BIOMETRIC_TIMEOUT=300
MAX_VERIFICATION_ATTEMPTS=3
"""
    
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("❌ Cancelled. Existing .env file preserved.")
            return False
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created with HTTPS enabled!")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

def check_requirements():
    """Check if required packages are installed"""
    try:
        import ssl
        print("✅ SSL module available")
        return True
    except ImportError:
        print("❌ SSL module not available")
        return False

def main():
    """Main setup function"""
    print("🔒 HTTPS Setup for Phone Fingerprint Support")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        print("❌ SSL requirements not met. Please check your Python installation.")
        return
    
    # Create .env file
    if not create_env_file():
        return
    
    print("\n📋 Next Steps:")
    print("1. Start your server: python app.py")
    print("2. Access via HTTPS: https://your-ip:5000")
    print("3. Test fingerprint: https://your-ip:5000/test-phone-fingerprint.html")
    print("4. Register students with fingerprint support!")
    
    print("\n🎯 For Students:")
    print("- Android: Use Chrome browser")
    print("- iPhone: Use Safari browser")
    print("- Access: https://your-server-ip:5000")
    
    print("\n⚠️  Important:")
    print("- Browser will show 'Not Secure' warning for self-signed certificate")
    print("- Click 'Advanced' → 'Proceed to site' to continue")
    print("- This is normal for development/testing")
    
    print("\n🎉 HTTPS is now enabled!")
    print("Phone fingerprint sensors will work on network IPs!")

if __name__ == "__main__":
    main()
