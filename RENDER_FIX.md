# Fix Render Deployment Error (Status 127)

## Problem
You're getting: `Exited with status 127` with error `gunicorn: command not found`

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

## Why This Happens

Render allows you to set a custom start command in the dashboard. If you set one during initial setup, it overrides the `Procfile`. The custom command might have been set to `gunicorn app:app...` which doesn't work because `gunicorn` isn't in the PATH. Using `python -m gunicorn` fixes this.

