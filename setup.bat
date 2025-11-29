@echo off
echo ===============================================
echo  Smart Attendance System - Setup Script
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment created

echo.
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated

echo.
echo [3/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo [4/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo [OK] .env file created from example
    echo [WARNING] Please edit .env file and update your MySQL password!
) else (
    echo [INFO] .env file already exists
)

echo.
echo [5/5] Setup complete!
echo.
echo ===============================================
echo  Next Steps:
echo ===============================================
echo.
echo 1. Edit .env file with your MySQL credentials:
echo    - Open .env in a text editor
echo    - Update DB_PASSWORD with your MySQL password
echo.
echo 2. Create and import database:
echo    mysql -u root -p
echo    CREATE DATABASE attendance_qr_db;
echo    exit;
echo    mysql -u root -p attendance_qr_db ^< database\schema.sql
echo.
echo 3. Run the application:
echo    python app.py
echo.
echo 4. Open browser:
echo    http://localhost:5000
echo.
echo ===============================================
echo.
pause

