#!/bin/bash
set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install all requirements
pip install --no-cache-dir -r requirements.txt

# Verify gunicorn is installed
python -c "import gunicorn; print(f'Gunicorn version: {gunicorn.__version__}')"

