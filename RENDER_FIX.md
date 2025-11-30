# Fix Render Deployment Error

## Problem 1: gunicorn not found (Status 127)
You're getting: `Exited with status 127` with error `gunicorn: command not found`

## Problem 2: No module named gunicorn (Status 1)
You're getting: `/opt/render/project/src/.venv/bin/python: No module named gunicorn`

This means gunicorn is not being installed during the build process.

## Solution

The issue is that Render might be using a custom start command from the dashboard that overrides the Procfile. Here's how to fix it:

### Option 1: Update Start Command in Render Dashboard (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your web service (`attendance-qr-app`)
3. Go to **Settings** tab
4. Scroll down to **Start Command**
5. **Delete/clear the existing start command** (or update it to):
   ```
   python -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
   ```
6. Click **Save Changes**
7. Go to **Manual Deploy** → **Deploy latest commit**

### Option 2: Let Procfile Handle It

1. Go to your Render dashboard
2. Click on your web service
3. Go to **Settings** tab
4. Scroll to **Start Command**
5. **Clear/delete the start command field completely** (leave it empty)
6. This will force Render to use the `Procfile`
7. Click **Save Changes**
8. Go to **Manual Deploy** → **Deploy latest commit**

### Option 3: Use the Start Script

1. In Render dashboard → Settings → Start Command
2. Use:
   ```
   bash start.sh
   ```
3. Save and redeploy

## Verify the Fix

After updating, check the deploy logs. You should see:
- ✅ `==> Running 'python -m gunicorn app:app...'`
- ✅ `[INFO] Starting gunicorn...`
- ✅ `Listening at: http://0.0.0.0:XXXX`

Instead of:
- ❌ `gunicorn: command not found`

## Fix: gunicorn Not Installing

If you see "No module named gunicorn", the build process isn't installing gunicorn. Fix this:

### Option 1: Update Build Command in Dashboard

1. Go to Render dashboard → Your service → **Settings**
2. Find **Build Command**
3. Update it to:
   ```
   pip install --upgrade pip && pip install -r requirements.txt
   ```
4. Save and redeploy

### Option 2: Clear Build Cache

1. Go to Render dashboard → Your service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. This forces a fresh build

### Option 3: Verify requirements.txt

Make sure `gunicorn==21.2.0` is in your `requirements.txt` file (it should be).

## Why This Happens

1. **Custom start command:** Render allows you to set a custom start command in the dashboard. If you set one during initial setup, it overrides the `Procfile`. The custom command might have been set to `gunicorn app:app...` which doesn't work because `gunicorn` isn't in the PATH. Using `python -m gunicorn` fixes this.

2. **Build cache:** Render caches builds. If requirements.txt was updated but cache wasn't cleared, old packages are used.

3. **Virtual environment:** Render uses a virtual environment. The build command must install packages into the correct venv.

