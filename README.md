# 🎓 Smart College Attendance System - QR Code Based

A comprehensive web-based attendance management system that uses dynamic QR codes to prevent proxy attendance. Built with Python Flask (backend) and HTML/CSS/JavaScript (frontend), integrated with MySQL database.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Security Features](#security-features)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### 📱 Mobile-First Design (NEW!)
- ✅ **Fully Responsive** - Works seamlessly on phones, tablets, and desktops
- ✅ **PWA Support** - Install as a native app on any device
- ✅ **Offline Functionality** - Core features work without internet
- ✅ **Touch-Optimized** - Large touch targets and gesture support
- ✅ **Camera Integration** - Native QR scanning with auto-focus
- ✅ **Haptic Feedback** - Vibration feedback for actions
- ✅ **Screen Wake Lock** - Keep screen on during QR scanning
- ✅ **Network Detection** - Real-time online/offline status
- 📖 **[Mobile Guide →](docs/MOBILE_GUIDE.md)**

### Student Portal
- ✅ Student registration and login
- 👆 **Phone Fingerprint Authentication** - Use your phone's fingerprint sensor for secure attendance
- 📊 Dashboard with attendance statistics
- 💰 Fee details and payment status
- 📚 Subject-wise attendance tracking
- 📅 Attendance history
- 📱 QR code scanning for attendance marking
- 🎯 Real-time attendance percentage
- 📈 Performance metrics (CGPA, backlogs)
- 🔐 **WebAuthn Biometric Security** - Touch ID, Face ID, Windows Hello support

### Teacher Portal
- 🔐 Teacher login (secure authentication)
- 📋 Profile management
- ➕ Create attendance sessions
- 🔄 Dynamic QR code generation (refreshes every 5-6 seconds)
- 📊 Real-time attendance tracking
- 📈 Subject-wise statistics
- 📅 Session history
- 👥 Student attendance reports

### Anti-Proxy Security
- 👆 **Biometric Authentication** - Phone fingerprint sensor verification (WebAuthn)
- ⏱️ QR codes expire after 6 seconds
- 🔑 Unique tokens for each QR code
- 🚫 Prevention of QR code reuse
- 🔒 JWT-based authentication
- 🔐 Bcrypt password hashing
- 📍 Optional geolocation tracking
- 🌐 IP address logging
- 🔐 FIDO2/WebAuthn compliance for biometric security

## 🛠️ Technology Stack

### Backend
- **Framework:** Flask 2.3.3
- **Database:** MySQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **QR Code Generation:** qrcode + Pillow

### Frontend
- **HTML5** - Structure with PWA support
- **CSS3** - Modern UI with responsive mobile-first design
- **JavaScript (ES6+)** - Interactive features & mobile utilities
- **Service Worker** - Offline functionality & caching
- **Fetch API** - RESTful API communication
- **Web APIs** - Camera, Vibration, Wake Lock, Share

### Database
- **MySQL 8.x** - Relational database
- **Foreign Keys** - Data integrity
- **Indexes** - Query optimization

## 📁 Project Structure

```
attendance-qr-system/
├── app.py                          # Main Flask application
├── config.py                       # Configuration settings
├── models.py                       # Database models
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
│
├── database/
│   └── schema.sql                  # Database schema & sample data
│
├── routes/
│   ├── student_routes.py          # Student API endpoints
│   ├── teacher_routes.py          # Teacher API endpoints
│   └── attendance_routes.py       # Attendance API endpoints
│
├── utils/
│   ├── auth.py                    # Authentication utilities
│   ├── qr_generator.py            # QR code generation
│   └── validators.py              # Input validation
│
├── static/
│   ├── index.html                 # Landing page
│   ├── student_dashboard.html     # Student dashboard
│   ├── teacher_dashboard.html     # Teacher dashboard
│   ├── offline.html               # Offline fallback page
│   ├── manifest.json              # PWA manifest
│   ├── service-worker.js          # Service worker for offline support
│   │
│   ├── css/
│   │   └── style.css             # Responsive stylesheet
│   │
│   ├── js/
│   │   ├── api.js                # API helper functions
│   │   ├── auth.js               # Authentication logic
│   │   ├── mobile-utils.js       # Mobile utilities & PWA support
│   │   ├── student_dashboard.js  # Student dashboard logic
│   │   └── teacher_dashboard.js  # Teacher dashboard logic
│   │
│   └── icons/                     # PWA app icons
│       └── README.md             # Icon generation guide
│
├── docs/
│   ├── API_DOCUMENTATION.md         # API endpoints documentation
│   ├── SETUP_GUIDE.md              # Detailed setup instructions
│   ├── MOBILE_GUIDE.md             # Comprehensive mobile features guide
│   ├── PHONE_FINGERPRINT_GUIDE.md  # Phone fingerprint sensor guide
│   └── ER_DIAGRAM.md               # Database ER diagram
│
├── test-phone-fingerprint.html     # Fingerprint sensor test page
└── phone-fingerprint-quickstart.html  # Quick start guide for students
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- MySQL 8.0 or higher
- pip (Python package manager)
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd attendance-qr-system
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Quick HTTPS setup (recommended for phone fingerprint support)
# Set SSL_ENABLED=true in .env file

# OR manually create .env file:
```

Edit `.env` with your configuration:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_super_secret_key_here_change_this

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_qr_db
DB_PORT=3306

# QR Code Settings
QR_TOKEN_EXPIRY=6

# HTTPS Configuration (for phone fingerprint support)
SSL_ENABLED=true
BIOMETRIC_ENABLED=true
```

## 🗄️ Database Setup

### Step 1: Start MySQL Server

Make sure your MySQL server is running. You can use:
- **XAMPP** (Windows)
- **WAMP** (Windows)
- **MAMP** (Mac)
- **MySQL Workbench** (All platforms)

### Step 2: Create Database

Option 1: Using MySQL command line:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE attendance_qr_db;
exit;
```

Option 2: Import the schema directly:

```bash
mysql -u root -p < database/schema.sql
```

### Step 3: Verify Database

The `schema.sql` file includes:
- All table definitions
- Foreign key constraints
- Sample data for testing
  - 4 sample students (password: "password123")
  - 3 sample teachers (password: "password123")
  - Sample sessions

## ▶️ Running the Application

### Start the Flask Server

```bash
python app.py
```

The application will start on `http://localhost:5000`

### Access the Application

**HTTP Mode (Development):**
- **Landing Page:** http://localhost:5000
- **Student Dashboard:** http://localhost:5000/student/dashboard (after login)
- **Teacher Dashboard:** http://localhost:5000/teacher/dashboard (after login)

**HTTPS Mode (Phone Fingerprint Support):**
- **Landing Page:** https://your-server-ip:5000
- **Student Dashboard:** https://your-server-ip:5000/student/dashboard (after login)
- **Teacher Dashboard:** https://your-server-ip:5000/teacher/dashboard (after login)

### 📱 Mobile Access with Fingerprint Support

**For mobile users with fingerprint sensors:**
1. **Enable HTTPS**: Set `SSL_ENABLED=true` in .env file
2. **Start server**: `python app.py`
3. **Open phone browser**: Navigate to `https://your-server-ip:5000`
4. **Accept certificate**: Click "Advanced" → "Proceed to site" (for self-signed cert)
5. **Register fingerprint**: During student registration
6. **Use fingerprint**: For attendance marking

**Browser Requirements:**
- **Android**: Chrome or Edge browser
- **iPhone**: Safari browser (required!)

**Quick Setup:** Set `SSL_ENABLED=true` in your `.env` file. See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed instructions.

## 📖 Usage Guide

### For Students

1. **Registration:**
   - Click "Register here" on the student login card
   - Fill in all required information
   - **Register your fingerprint** (optional but recommended)
     - On Android: Use Chrome/Edge browser
     - On iPhone: Use Safari browser (required)
     - Follow biometric prompts on your phone
   - Submit to create account
   - 📖 [Phone Fingerprint Setup Guide →](static/phone-fingerprint-quickstart.html)

2. **Login:**
   - Enter email and password
   - Access dashboard after successful login

3. **Mark Attendance:**
   - Teacher displays QR code in class
   - Scan QR code using camera OR copy/paste QR code data
   - **Verify with fingerprint** (if registered)
     - Place finger on your phone's sensor
     - System verifies biometric authentication
   - Attendance marked automatically on success
   - Confirmation shown

4. **View Statistics:**
   - Dashboard shows overall attendance percentage
   - Subject-wise attendance breakdown
   - Fee status and academic performance

### 📱 Phone Fingerprint Setup

**For Android Users:**
- Open in Chrome or Edge browser
- Register fingerprint during sign-up
- Use your phone's fingerprint sensor to mark attendance
- Works with all Android fingerprint sensors (Android 6.0+)

**For iPhone Users:**
- **Must use Safari browser** (Chrome won't work!)
- Register Touch ID or Face ID during sign-up
- Use biometric authentication for attendance
- Works with Touch ID and Face ID

**Testing Your Setup:**
- Visit: [Test Your Fingerprint Sensor](static/test-phone-fingerprint.html)
- Complete guide: [docs/PHONE_FINGERPRINT_GUIDE.md](docs/PHONE_FINGERPRINT_GUIDE.md)

### For Teachers

1. **Login:**
   - Use credentials: `dr.sharma@college.edu` / `password123`
   - Or any other teacher account

2. **Create Session:**
   - Fill in subject, branch, semester, and total students
   - Click "Create Session"

3. **Display QR Code:**
   - QR code automatically displayed after session creation
   - Code refreshes every 6 seconds
   - Share screen or project for students to scan

4. **Monitor Attendance:**
   - Real-time count of present students
   - Progress bar shows attendance percentage
   - End session when class is complete

5. **View Reports:**
   - Recent sessions table shows all sessions
   - Click "View Details" for attendance report

## 🔒 Security Features

### Password Security
- Passwords hashed using **bcrypt** (salt rounds: 12)
- Passwords must meet complexity requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit

### QR Code Security
- **Dynamic Generation:** New QR code every 5-6 seconds
- **Unique Tokens:** Each QR contains a unique random token
- **Token Expiry:** Tokens expire after 6 seconds
- **One-time Use:** Tokens cannot be reused
- **Session Validation:** QR data includes session validation

### API Security
- **JWT Authentication:** All protected routes require valid JWT token
- **Token Expiry:** Tokens expire after 24 hours
- **Role-based Access:** Student/Teacher specific endpoints
- **CORS Protection:** Configured CORS policy

### Additional Security
- **SQL Injection Prevention:** Parameterized queries via SQLAlchemy
- **XSS Protection:** Input sanitization
- **Branch/Semester Validation:** Students can only mark attendance for their classes
- **Geolocation Logging:** Optional location tracking
- **IP Address Logging:** Track attendance location

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Include JWT token in headers:
```
Authorization: Bearer <token>
```

### Endpoints

#### Student Endpoints
- `POST /api/student/register` - Register new student
- `POST /api/student/login` - Student login
- `GET /api/student/profile` - Get student profile (Auth)
- `GET /api/student/attendance` - Get attendance records (Auth)
- `GET /api/student/dashboard/stats` - Get dashboard statistics (Auth)

#### Teacher Endpoints
- `POST /api/teacher/login` - Teacher login
- `GET /api/teacher/profile` - Get teacher profile (Auth)
- `GET /api/teacher/sessions` - Get all sessions (Auth)
- `GET /api/teacher/session/<id>/attendance` - Get session attendance (Auth)
- `GET /api/teacher/dashboard/stats` - Get dashboard statistics (Auth)

#### Attendance Endpoints
- `POST /api/attendance/create-session` - Create new session (Teacher Auth)
- `GET /api/attendance/generate-qr/<session_id>` - Generate QR code (Teacher Auth)
- `POST /api/attendance/mark` - Mark attendance (Student Auth)
- `POST /api/attendance/session/<id>/end` - End session (Teacher Auth)
- `GET /api/attendance/session/<id>/stats` - Get session stats (Teacher Auth)

For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## 🎨 Screenshots

### Landing Page
Clean, modern interface with student and teacher login portals

### Student Dashboard
- Profile information
- Attendance statistics
- Subject-wise breakdown
- QR code scanner
- Attendance history

### Teacher Dashboard
- Profile overview
- Session creation
- Dynamic QR code display
- Real-time attendance tracking
- Session management

## 🧪 Testing

### Sample Credentials

**Students:**
```
Email: rahul.sharma@gmail.com
Password: student123

Other students (Division A & B):
- priya.patel@gmail.com / student123
- arjun.kumar@gmail.com / student123
- karan.desai@gmail.com / student123
- neha.mehta@gmail.com / student123
(All use password: student123)
```

**Teachers:**
```
Email: dr.sharma@college.edu
Password: password123
```

### Testing Workflow

1. Login as teacher
2. Create a new attendance session
3. Copy the QR code data displayed
4. In another browser/tab, login as student
5. Paste QR code data and mark attendance
6. See real-time update in teacher dashboard

## 🔧 Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `attendance_qr_db` exists

### QR Code Not Generating
- Check if session is active
- Verify teacher authentication
- Check browser console for errors

### Attendance Not Marking
- Verify QR code hasn't expired
- Check branch/semester match
- Ensure student is authenticated
- Check if attendance already marked

## 📝 Future Enhancements

- [✅] ~~Mobile app integration~~ **COMPLETED - PWA Support Added!**
- [ ] Email notifications
- [ ] SMS alerts for low attendance
- [ ] Excel/PDF report generation
- [ ] Push notifications for attendance reminders
- [ ] Facial recognition integration
- [ ] Admin panel for system management
- [ ] Attendance analytics dashboard
- [ ] Multi-language support
- [ ] Background sync for offline attendance marking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

Developed as a college project for attendance management system.

## 📞 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team

## 🙏 Acknowledgments

- Flask framework and community
- MySQL database
- QR code libraries
- All contributors and testers

---

**Note:** This is an educational project. For production deployment, additional security measures and optimizations are recommended.

# attendance_through_qr_code
# attendance_through_qr_code
