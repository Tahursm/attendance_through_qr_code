#!/bin/bash

echo "Starting Smart Attendance System..."
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Activate virtual environment
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
else
    echo -e "${RED}[ERROR]${NC} Virtual environment not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}[WARNING]${NC} .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Run the application
echo "Starting Flask server..."
echo
echo -e "${GREEN}Application will be available at:${NC} http://localhost:5000"
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop the server"
echo
python app.py

