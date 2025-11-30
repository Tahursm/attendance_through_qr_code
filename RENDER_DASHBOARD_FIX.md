# ⚠️ CRITICAL: Fix Render Deployment - gunicorn Not Installing

## The Problem
You're getting: `/opt/render/project/src/.venv/bin/python: No module named gunicorn`

This means gunicorn is **NOT being installed** during the build, even though it's in requirements.txt.

## The Fix (Do This Now!)

### Step 1: Fix Build Command
1. Go to: https://dashboard.render.com
2. Click on your service: **attendance-qr-app**
3. Click **Settings** tab (left sidebar)
4. Find **Build Command** section
5. **Set Build Command to:**
   ```
   pip install --upgrade pip && pip install -r requirements.txt && pip install gunicorn==21.2.0 psycopg2-binary==2.9.9
   ```
   This explicitly installs gunicorn and psycopg2-binary which seem to be skipped
6. Click **Save Changes**

### Step 2: Update Start Command
1. Still in Settings, find **Start Command** section
2. **DELETE the existing command** (it probably says: `gunicorn app:app...`)
3. **Type this EXACT command:**
   ```
   python -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
   ```
   OR **leave it EMPTY** to use the Procfile
4. Click **Save Changes**

### Step 3: Clear Build Cache & Redeploy
1. Go to **Manual Deploy** tab
2. Click **Clear build cache & deploy** button
3. Wait for deployment to complete
4. Check the logs - you should see gunicorn being installed

### Alternative: Use Procfile (Easier)
If you want Render to automatically use the Procfile:
1. Go to Settings → Start Command
2. **DELETE everything** in the Start Command field (leave it completely empty)
3. Click **Save Changes**
4. Render will automatically use the `Procfile`
5. Clear build cache & deploy

## Verify It's Fixed
After redeploying, check the logs. You should see:
- ✅ `==> Running 'python -m gunicorn app:app...'`
- ✅ `[INFO] Starting gunicorn`
- ✅ `Listening at: http://0.0.0.0:XXXX`

NOT:
- ❌ `==> Running 'gunicorn app:app...'`
- ❌ `gunicorn: command not found`

## Why This Happens
When you first created the service, you (or Render) set a custom start command. This custom command **overrides** the Procfile. The custom command was set to `gunicorn app:app...` which doesn't work because `gunicorn` executable isn't in PATH. Using `python -m gunicorn` fixes this by using Python's module execution.

