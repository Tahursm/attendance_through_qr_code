# Setting Up Teacher Accounts on Render

## Problem
You're getting "Invalid email or password" because no teacher accounts exist in the database yet.

## Solution: Create Sample Teacher Accounts

### Option 1: Use Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **PostgreSQL database** service
3. Click on the **"Shell"** tab (or "Connect" → "Shell")
4. Or use your **web service** → **Shell** tab

5. Run this command:
```bash
python create_teacher.py
```

This will create a teacher account with:
- **Email:** `dr.sharma@college.edu`
- **Password:** `password123`

### Option 2: Initialize Full Database

If you want to create all sample accounts (students + teachers):

1. Go to Render dashboard → Your web service → **Shell** tab
2. Run:
```bash
python init_db.py
```

This creates:
- **3 Teacher accounts** (password: `password123`)
  - `dr.sharma@college.edu`
  - `prof.mehta@college.edu`
  - `dr.kumar@college.edu`
- **4 Student accounts** (password: `student123`)
  - `rahul.sharma@gmail.com`
  - `priya.patel@gmail.com`
  - `arjun.kumar@gmail.com`
  - `ananya.singh@gmail.com`

### Option 3: Create Teacher via Python Script

1. Go to Render dashboard → Your web service → **Shell** tab
2. Run Python interactively:
```python
python
```

3. Then paste this code:
```python
from app import create_app
from models import db, Teacher
from utils.auth import hash_password
from datetime import date

app = create_app()
with app.app_context():
    teacher = Teacher(
        teacher_id='TCH2024001',
        email='dr.sharma@college.edu',
        password_hash=hash_password('password123'),
        full_name='Dr. Rajesh Sharma',
        branch='Computer Science',
        designation='Professor',
        qualification='Ph.D. in Computer Science',
        phone='9998887770',
        gender='Male',
        joining_date=date(2010, 7, 1),
        experience_years=14,
        specialization='Data Structures and Algorithms'
    )
    db.session.add(teacher)
    db.session.commit()
    print("Teacher created!")
```

## Test Login

After creating the account, try logging in with:
- **Email:** `dr.sharma@college.edu`
- **Password:** `password123`

## Note

The `init_db.py` script will **DROP ALL TABLES** and recreate them. Only use it if you're okay with losing existing data. Use `create_teacher.py` if you just want to add a teacher without affecting existing data.

