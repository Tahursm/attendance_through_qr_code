#!/bin/bash

echo "==============================================="
echo "  Smart Attendance System - Setup Script"
echo "==============================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/downloads/"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to create virtual environment"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Virtual environment created"

echo
echo "[2/5] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to activate virtual environment"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Virtual environment activated"

echo
echo "[3/5] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install dependencies"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Dependencies installed"

echo
echo "[4/5] Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}[OK]${NC} .env file created from example"
    echo -e "${YELLOW}[WARNING]${NC} Please edit .env file and update your MySQL password!"
else
    echo -e "${YELLOW}[INFO]${NC} .env file already exists"
fi

echo
echo "[5/5] Making script executable..."
chmod +x setup.sh
echo -e "${GREEN}[OK]${NC} Setup complete!"

echo
echo "==============================================="
echo "  Next Steps:"
echo "==============================================="
echo
echo "1. Edit .env file with your MySQL credentials:"
echo "   nano .env"
echo "   Update DB_PASSWORD with your MySQL password"
echo
echo "2. Create and import database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE attendance_qr_db;"
echo "   exit;"
echo "   mysql -u root -p attendance_qr_db < database/schema.sql"
echo
echo "3. Run the application:"
echo "   source venv/bin/activate"
echo "   python app.py"
echo
echo "4. Open browser:"
echo "   http://localhost:5000"
echo
echo "==============================================="
echo

