#!/bin/bash
set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install all requirements
pip install --no-cache-dir -r requirements.txt

# Explicitly install gunicorn if not already installed
pip install --no-cache-dir gunicorn==21.2.0

# Verify gunicorn is installed
python -c "import gunicorn; print(f'Gunicorn version: {gunicorn.__version__}')" || echo "ERROR: Gunicorn not installed!"

