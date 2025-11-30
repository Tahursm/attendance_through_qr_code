# Deployment Guide

This guide will help you deploy the Attendance QR Code application to free hosting platforms.

## 🚀 Recommended: Render.com

### Why Render?
- ✅ Free tier with 750 hours/month
- ✅ Free PostgreSQL database included
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deploy from GitHub
- ✅ Easy environment variable management
- ⚠️ Spins down after 15 min inactivity (wakes on request)

### Deployment Steps:

1. **Sign up at [Render.com](https://render.com)** (free account)

2. **Create a PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `attendance-db`
   - Plan: Free
   - Click "Create Database"
   - Note the connection details

3. **Create a Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `attendance_through_qr_code` repository
   - Configure:
     - **Name:** `attendance-qr-app`
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `python -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
     - **Plan:** Free

4. **Set Environment Variables:**
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = (generate a random secret key)
   - `DB_HOST` = (from PostgreSQL database)
   - `DB_USER` = (from PostgreSQL database)
   - `DB_PASSWORD` = (from PostgreSQL database)
   - `DB_NAME` = (from PostgreSQL database)
   - `DB_PORT` = `5432`
   - `QR_TOKEN_EXPIRY` = `6`

5. **Initialize Database:**
   - After first deployment, run migrations:
   - Go to your database → "Connect" → Use the connection string
   - Or use Render's shell to run: `python init_db.py`

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)
   - Your app will be live at: `https://attendance-qr-app.onrender.com`

### Using render.yaml (Alternative Method):

If you prefer, you can use the `render.yaml` file:
1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure everything

---

## 🚂 Alternative: Railway.app

### Why Railway?
- ✅ $5 free credit/month
- ✅ Fast deployments
- ✅ Supports MySQL and PostgreSQL
- ✅ Great documentation

### Deployment Steps:

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Database:**
   - Click "+ New" → "Database" → "PostgreSQL" or "MySQL"
   - Railway will automatically set environment variables

4. **Configure Environment Variables:**
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = (generate random key)
   - Database variables are auto-set by Railway

5. **Deploy:**
   - Railway auto-detects Python apps
   - Add `Procfile` if needed
   - Deploy happens automatically

---

## 🐍 Alternative: PythonAnywhere

### Why PythonAnywhere?
- ✅ Flask-friendly
- ✅ Simple setup
- ⚠️ Limited free tier resources

### Deployment Steps:

1. **Sign up at [PythonAnywhere.com](https://www.pythonanywhere.com)**

2. **Upload your code:**
   - Use Files tab to upload or clone from GitHub

3. **Create Web App:**
   - Go to Web tab → "Add a new web app"
   - Choose Flask
   - Select Python version

4. **Configure:**
   - Set source code path
   - Set WSGI file
   - Configure database (MySQL available)

5. **Set Environment Variables:**
   - In Web app configuration

---

## 📝 Important Notes:

### Database Migration:
After deployment, you need to initialize the database:
```bash
# Option 1: Use init_db.py
python init_db.py

# Option 2: Use Flask shell
flask shell
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

### Environment Variables:
Make sure to set all required environment variables:
- `SECRET_KEY` - Generate a strong random key
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `FLASK_ENV=production`
- `QR_TOKEN_EXPIRY=6`

### PostgreSQL vs MySQL:
- **Render/Railway:** Use PostgreSQL (included free)
- **PythonAnywhere:** MySQL available
- The app supports both via `config.py`

### Generating Secret Key:
```python
import secrets
print(secrets.token_hex(32))
```

---

## 🔧 Troubleshooting:

1. **App crashes on startup:**
   - Check environment variables are set
   - Verify database connection
   - Check logs in platform dashboard

2. **Database connection errors:**
   - Verify database credentials
   - Check if database is accessible
   - Ensure database is created

3. **Static files not loading:**
   - Verify `static_folder` in Flask config
   - Check file paths

4. **QR codes not generating:**
   - Check file permissions
   - Verify `qr_codes/` directory exists (or use in-memory)

---

## 🎯 Quick Comparison:

| Platform | Free Tier | Database | Ease | Best For |
|----------|-----------|----------|------|----------|
| **Render** | 750 hrs/mo | PostgreSQL ✅ | ⭐⭐⭐⭐⭐ | Production |
| **Railway** | $5 credit | MySQL/PostgreSQL | ⭐⭐⭐⭐ | Quick deploy |
| **PythonAnywhere** | Limited | MySQL | ⭐⭐⭐ | Learning |

**Recommendation: Start with Render.com** - It's the most straightforward and production-ready option.

