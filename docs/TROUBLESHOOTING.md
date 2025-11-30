# Troubleshooting Guide

## 503 Service Unavailable Error

### Understanding the Error

A **503 Service Unavailable** error occurs when:
- The Flask server is running, but cannot handle the request
- The database connection is failing
- The database server is not running or not accessible

### Common Causes

1. **Database Server Not Running**
   - MySQL/MariaDB service is not started
   - Database server crashed or stopped

2. **Database Connection Configuration Issues**
   - Incorrect database credentials in `.env` file
   - Wrong database host, port, or name
   - Database doesn't exist

3. **Network Issues**
   - Firewall blocking database connections
   - Database server not accessible from the application server

### How to Diagnose

#### 1. Check if the Flask Server is Running

```bash
# Check if the server is running on port 5000
curl http://localhost:5000/api/health
```

Expected response if healthy:
```json
{
  "status": "healthy",
  "message": "API is running",
  "database": "connected"
}
```

If database is disconnected:
```json
{
  "status": "unhealthy",
  "message": "API is running but database is not accessible",
  "database": "disconnected",
  "error": "..."
}
```

#### 2. Check Database Server Status

**Windows:**
```powershell
# Check MySQL service status
Get-Service -Name MySQL*
# or
Get-Service -Name MariaDB*
```

**Linux/Mac:**
```bash
# Check MySQL service status
sudo systemctl status mysql
# or
sudo systemctl status mariadb
```

#### 3. Test Database Connection

**Using MySQL Command Line:**
```bash
mysql -u root -p -h localhost -P 3306
```

**Using Python:**
```python
from config import config
import mysql.connector

try:
    conn = mysql.connector.connect(
        host=config['development'].DB_HOST,
        user=config['development'].DB_USER,
        password=config['development'].DB_PASSWORD,
        database=config['development'].DB_NAME,
        port=int(config['development'].DB_PORT)
    )
    print("Database connection successful!")
    conn.close()
except Exception as e:
    print(f"Database connection failed: {e}")
```

#### 4. Check .env File Configuration

Ensure your `.env` file exists and has correct values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_qr_db
DB_PORT=3306
```

### Solutions

#### Solution 1: Start the Database Server

**Windows:**
```powershell
# Start MySQL service
Start-Service -Name MySQL80
# or
Start-Service -Name MariaDB
```

**Linux:**
```bash
sudo systemctl start mysql
# or
sudo systemctl start mariadb
```

**Mac:**
```bash
brew services start mysql
# or
brew services start mariadb
```

#### Solution 2: Create the Database

If the database doesn't exist:

```sql
CREATE DATABASE IF NOT EXISTS attendance_qr_db;
```

Or use the provided schema:
```bash
mysql -u root -p < database/schema.sql
```

#### Solution 3: Fix Database Credentials

1. Check your `.env` file
2. Verify the database user has proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON attendance_qr_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Solution 4: Initialize Database Tables

If tables don't exist, run:

```bash
python init_db.py
```

Or manually:
```python
from app import create_app
from models import db

app = create_app()
with app.app_context():
    db.create_all()
    print("Tables created successfully!")
```

### Error Messages Explained

#### "Database connection failed"
- The server cannot establish a connection to the database
- **Action**: Check if database server is running and credentials are correct

#### "Database query failed"
- Connection exists but queries are failing
- **Action**: Check database permissions and table existence

#### "Service temporarily unavailable"
- Generic 503 error
- **Action**: Check server logs for detailed error messages

### Prevention

1. **Always check database status before starting the Flask app**
2. **Use the health check endpoint** (`/api/health`) to monitor server status
3. **Set up proper error logging** to catch issues early
4. **Use connection pooling** for better database connection management

### Additional Resources

- [Flask SQLAlchemy Documentation](https://flask-sqlalchemy.palletsprojects.com/)
- [MySQL Connection Troubleshooting](https://dev.mysql.com/doc/refman/8.0/en/problems-connecting.html)
- [Database Setup Guide](SETUP_GUIDE.md)

