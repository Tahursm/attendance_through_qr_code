# MySQL Workbench Connection Details

## Current Database Configuration

Based on your `config.py` file, here are the **default MySQL connection parameters**:

### Connection Parameters for MySQL Workbench:

```
Connection Name: Attendance QR System (or any name you prefer)
Connection Method: Standard (TCP/IP)

Hostname: localhost
Port: 3306
Username: root
Password: (empty by default, or your MySQL root password)
Default Schema: attendance_qr_db
```

## Step-by-Step Connection Guide

### 1. **Create a New Connection in MySQL Workbench:**

1. Open MySQL Workbench
2. Click the **"+"** icon next to "MySQL Connections" (or go to Database → Manage Connections)
3. Enter the connection details:

   - **Connection Name**: `Attendance QR System` (or any name)
   - **Hostname**: `localhost` (or `127.0.0.1`)
   - **Port**: `3306`
   - **Username**: `root` (or your MySQL username)
   - **Password**: Click "Store in Keychain" and enter your MySQL password
   - **Default Schema**: `attendance_qr_db` (optional, can be selected after connection)

4. Click **"Test Connection"** to verify
5. Click **"OK"** to save

### 2. **Create the Database (if it doesn't exist):**

Before connecting, make sure the database exists. You can:

**Option A: Create via MySQL Workbench**
1. Connect to MySQL server (without selecting a default schema)
2. Run this SQL command:
   ```sql
   CREATE DATABASE IF NOT EXISTS attendance_qr_db;
   ```

**Option B: Create via Command Line**
```bash
mysql -u root -p
CREATE DATABASE IF NOT EXISTS attendance_qr_db;
EXIT;
```

### 3. **Switch Your Project to Use MySQL:**

Currently, your project uses SQLite. To switch to MySQL:

1. **Create a `.env` file** in your project root with:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=attendance_qr_db
   DB_PORT=3306
   SECRET_KEY=your-secret-key-here
   ```

2. **Update `config.py`** to use MySQL instead of SQLite:
   - Uncomment line 22 (MySQL connection string)
   - Comment out line 20 (SQLite connection string)

3. **Restart your Flask application**

## Current Default Values (from config.py):

- **DB_HOST**: `localhost`
- **DB_USER**: `root`
- **DB_PASSWORD**: `` (empty string)
- **DB_NAME**: `attendance_qr_db`
- **DB_PORT**: `3306`

## Important Notes:

⚠️ **If you haven't set up MySQL yet:**
- Make sure MySQL Server is installed and running
- The default password might be empty (for local development)
- If you set a root password during installation, use that password

⚠️ **If you want to keep using SQLite:**
- SQLite databases cannot be connected via MySQL Workbench
- You can use SQLite Browser or DB Browser for SQLite instead
- Your current database file is at: `instance/attendance.db`

## Troubleshooting:

1. **Connection Refused**: Make sure MySQL Server is running
2. **Access Denied**: Check your username and password
3. **Database doesn't exist**: Create it first using the SQL command above
4. **Port 3306 in use**: Check if MySQL is using a different port

## Quick Connection Test:

After setting up, you can test the connection by clicking "Test Connection" in MySQL Workbench. If successful, you'll see a green checkmark.

