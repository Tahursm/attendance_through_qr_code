@echo off
echo Starting Smart Attendance System...
echo.

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo [ERROR] Virtual environment not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

REM Run the application
echo Starting Flask server...
echo.
echo Application will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py

