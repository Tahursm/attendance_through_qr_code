# 📚 Detailed Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Database Configuration](#database-configuration)
5. [Environment Setup](#environment-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Python 3.8+**
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version`

2. **MySQL 8.0+**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/

3. **Git**
   - Download from: https://git-scm.com/downloads/
   - Verify installation: `git --version`

4. **Text Editor/IDE**
   - VS Code (Recommended): https://code.visualstudio.com/
   - PyCharm, Sublime Text, or any editor

## System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.14+, Linux
- **RAM:** 4 GB
- **Storage:** 500 MB free space
- **Processor:** Dual-core 2.0 GHz

### Recommended Requirements
- **RAM:** 8 GB or more
- **Storage:** 1 GB free space
- **Processor:** Quad-core 2.5 GHz or better

## Installation Steps

### Step 1: Clone Repository

```bash
# Navigate to your desired directory
cd /path/to/your/projects

# Clone the repository
git clone <repository-url>
cd attendance-qr-system
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Verification:**
You should see `(venv)` prefix in your terminal.

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Verify installation:**
```bash
pip list
```

You should see all packages from requirements.txt installed.

## Database Configuration

### Option 1: Using XAMPP (Windows)

1. **Install XAMPP**
   - Download from: https://www.apachefriends.org/
   - Install with default settings

2. **Start MySQL**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL
   - Wait for status to turn green

3. **Access phpMyAdmin**
   - Open browser: http://localhost/phpmyadmin
   - Click "New" to create database

4. **Import Schema**
   - Create database: `attendance_qr_db`
   - Click "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go"

### Option 2: Using MySQL Command Line

1. **Start MySQL Service**

   **Windows:**
   ```bash
   net start mysql
   ```

   **Linux:**
   ```bash
   sudo systemctl start mysql
   ```

   **macOS:**
   ```bash
   brew services start mysql
   ```

2. **Login to MySQL**
   ```bash
   mysql -u root -p
   ```
   Enter your MySQL root password.

3. **Create Database**
   ```sql
   CREATE DATABASE attendance_qr_db;
   USE attendance_qr_db;
   SOURCE database/schema.sql;
   exit;
   ```

### Option 3: Using MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect to Local Instance**
3. **Create New Schema**
   - Right-click in Navigator
   - Select "Create Schema"
   - Name: `attendance_qr_db`
   - Apply

4. **Import Schema**
   - Server → Data Import
   - Select "Import from Self-Contained File"
   - Choose: `database/schema.sql`
   - Select schema: `attendance_qr_db`
   - Start Import

### Verify Database Setup

```sql
-- Login to MySQL
mysql -u root -p

-- Switch to database
USE attendance_qr_db;

-- Check tables
SHOW TABLES;

-- Should show:
-- +-----------------------------+
-- | Tables_in_attendance_qr_db  |
-- +-----------------------------+
-- | attendance                  |
-- | lesson_plans                |
-- | sessions                    |
-- | students                    |
-- | teachers                    |
-- +-----------------------------+

-- Check sample data
SELECT COUNT(*) FROM students;  -- Should return 4
SELECT COUNT(*) FROM teachers;  -- Should return 3
```

## Environment Setup

### Create .env File

1. **Copy example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**

   **Windows (using notepad):**
   ```bash
   notepad .env
   ```

   **Linux/macOS:**
   ```bash
   nano .env
   # or
   vim .env
   ```

3. **Configure variables:**

   ```env
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=my_super_secret_key_12345_change_this_in_production
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=attendance_qr_db
   DB_PORT=3306
   
   # QR Code Settings
   QR_TOKEN_EXPIRY=6
   ```

4. **Important Notes:**
   - Replace `your_mysql_password_here` with your actual MySQL password
   - Change `SECRET_KEY` to a random string for security
   - Keep DB_NAME as `attendance_qr_db` (matches our database)

### Generate Secure Secret Key

**Python method:**
```python
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste as SECRET_KEY in .env file.

## Running the Application

### Step 1: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### Step 2: Start Flask Server

```bash
python app.py
```

**Expected Output:**
```
Database tables created successfully!
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

### Step 3: Access Application

Open your web browser and navigate to:
```
http://localhost:5000
```

You should see the landing page with student and teacher login cards.

## Testing the Application

### Test Student Registration

1. Click "Register here" under Student Portal
2. Fill in the form:
   - Student ID: TEST2024001
   - Full Name: Test Student
   - Email: test@college.edu
   - Password: Test@123
   - Branch: Computer Science
   - Semester: 6
   - Year: 2024
   - Phone: 9876543210
3. Click "Register"
4. You should be redirected to student dashboard

### Test Teacher Login

1. Go back to home page
2. Under Teacher Portal, enter:
   - Email: dr.sharma@college.edu
   - Password: password123
3. Click "Login"
4. You should see teacher dashboard

### Test Attendance Flow

**As Teacher:**
1. Login to teacher dashboard
2. Fill "Create New Attendance Session" form:
   - Subject: Test Subject
   - Branch: Computer Science
   - Semester: 6
   - Total Students: 30
3. Click "Create Session"
4. QR code will be displayed
5. Copy the QR data (JSON text below the QR image)

**As Student:**
1. Open new browser tab/window
2. Login as student
3. Scroll to "Mark Attendance" section
4. Paste QR data in text area
5. Click "Mark Attendance"
6. Success message should appear

**Back to Teacher:**
1. Watch present count increase in real-time
2. QR refreshes every 6 seconds

## Troubleshooting

### Problem: "Module not found" error

**Solution:**
```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: "Database connection failed"

**Solutions:**

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start mysql
   
   # Linux
   sudo systemctl status mysql
   ```

2. **Verify credentials in .env:**
   - Check DB_USER (usually 'root')
   - Check DB_PASSWORD
   - Check DB_HOST (usually 'localhost')

3. **Test connection manually:**
   ```bash
   mysql -u root -p
   ```

4. **Check if database exists:**
   ```sql
   SHOW DATABASES;
   -- Should list attendance_qr_db
   ```

### Problem: "Port 5000 already in use"

**Solution:**

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

**Linux/macOS:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

**Alternative:** Change port in app.py:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Problem: QR code not generating

**Causes & Solutions:**

1. **Session not active:**
   - Create a new session first

2. **Token expired:**
   - Wait for next refresh (6 seconds)

3. **Missing dependencies:**
   ```bash
   pip install qrcode pillow
   ```

### Problem: "CORS error" in browser console

**Solution:**
Ensure Flask-CORS is installed and configured:
```bash
pip install flask-cors
```

Check in app.py:
```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Problem: Static files not loading

**Solutions:**

1. **Check folder structure:**
   ```
   static/
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── api.js
   │   ├── auth.js
   │   ├── student_dashboard.js
   │   └── teacher_dashboard.js
   ├── index.html
   ├── student_dashboard.html
   └── teacher_dashboard.html
   ```

2. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Del
   - Firefox: Ctrl+Shift+Del
   - Or use incognito mode

3. **Verify Flask static folder:**
   In app.py, check:
   ```python
   app = Flask(__name__, static_folder='static', static_url_path='')
   ```

### Problem: Password validation failing

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)

**Valid examples:**
- `Password123`
- `Test@2024`
- `College#99`

### Problem: "Token expired" error

**Solutions:**

1. **Logout and login again:**
   - Tokens expire after 24 hours
   - Login to get new token

2. **Check system time:**
   - Ensure system clock is correct
   - JWT validation depends on timestamp

## Production Deployment

### For Production Environment:

1. **Change Flask environment:**
   ```env
   FLASK_ENV=production
   ```

2. **Use production server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Enable HTTPS:**
   - Use SSL certificates
   - Configure nginx/Apache reverse proxy

4. **Strengthen security:**
   - Change SECRET_KEY to strong random value
   - Use environment-specific .env files
   - Enable firewall rules
   - Set up regular backups

5. **Database optimization:**
   - Enable query caching
   - Add proper indexes
   - Regular maintenance

## Additional Resources

### Useful Commands

**Check Python version:**
```bash
python --version
```

**Check pip version:**
```bash
pip --version
```

**List installed packages:**
```bash
pip list
```

**Update pip:**
```bash
pip install --upgrade pip
```

**Freeze dependencies:**
```bash
pip freeze > requirements.txt
```

**Deactivate virtual environment:**
```bash
deactivate
```

### Log Files

**Flask logs:**
- Check terminal output where Flask is running
- Add logging in app.py for debugging

**MySQL logs:**
- Windows (XAMPP): `xampp/mysql/data/*.err`
- Linux: `/var/log/mysql/error.log`
- Check with: `SHOW VARIABLES LIKE 'log_error';`

## Support

If you encounter issues not covered here:
1. Check the main README.md
2. Review API_DOCUMENTATION.md
3. Check error messages carefully
4. Search online for specific error messages
5. Create an issue in the repository

---

**Happy Coding! 🚀**

