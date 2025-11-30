# 📡 API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained after successful login and expire after 24 hours.

---

## Table of Contents

1. [Student Endpoints](#student-endpoints)
2. [Teacher Endpoints](#teacher-endpoints)
3. [Attendance Endpoints](#attendance-endpoints)
4. [Error Responses](#error-responses)

---

## Student Endpoints

### 1. Register Student

**Endpoint:** `POST /api/student/register`

**Authentication:** Not required

**Description:** Register a new student account

**Request Body:**
```json
{
  "student_id": "STU2024001",
  "full_name": "Rahul Sharma",
  "email": "rahul.sharma@gmail.com",
  "password": "student123",
  "branch": "Computer Science",
  "semester": 6,
  "year": 2024,
  "phone": "9876543210",
  "address": "123 Main St",
  "gender": "Male",
  "admission_date": "2021-08-01"
}
```

**Required Fields:**
- `student_id`, `full_name`, `email`, `password`, `branch`, `semester`, `year`

**Response (201 Created):**
```json
{
  "message": "Student registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": 1,
    "student_id": "STU2024001",
    "email": "rahul.sharma@gmail.com",
    "full_name": "Rahul Sharma",
    "branch": "Computer Science",
    "semester": 6,
    "year": 2024,
    "cgpa": 0.0,
    "backlogs": 0
  }
}
```

---

### 2. Student Login

**Endpoint:** `POST /api/student/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "rahul.sharma@gmail.com",
  "password": "student123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": 1,
    "student_id": "STU2024001",
    "email": "rahul.sharma@gmail.com",
    "full_name": "Rahul Sharma",
    "branch": "Computer Science",
    "semester": 6,
    "year": 2024
  }
}
```

---

### 3. Get Student Profile

**Endpoint:** `GET /api/student/profile`

**Authentication:** Required (Student)

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "student": {
    "id": 1,
    "student_id": "STU2024001",
    "email": "rahul.sharma@gmail.com",
    "full_name": "Rahul Sharma",
    "branch": "Computer Science",
    "semester": 6,
    "year": 2024,
    "phone": "9876543210",
    "address": "123 Main St",
    "gender": "Male",
    "admission_date": "2021-08-01",
    "fee_status": "Paid",
    "total_fee": 50000.0,
    "paid_fee": 50000.0,
    "backlogs": 0,
    "cgpa": 8.5
  }
}
```

---

### 4. Get Student Attendance

**Endpoint:** `GET /api/student/attendance`

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "attendance": [
    {
      "id": 1,
      "subject": "Data Structures",
      "session_date": "2024-10-09",
      "marked_at": "2024-10-09T09:15:30",
      "status": "Present"
    },
    {
      "id": 2,
      "subject": "Database Management",
      "session_date": "2024-10-08",
      "marked_at": "2024-10-08T11:20:15",
      "status": "Present"
    }
  ],
  "statistics": {
    "total_sessions": 20,
    "present": 18,
    "absent": 2,
    "percentage": 90.0
  }
}
```

---

### 5. Get Attendance by Subject

**Endpoint:** `GET /api/student/attendance/subject/<subject>`

**Authentication:** Required (Student)

**Example:** `GET /api/student/attendance/subject/Data%20Structures`

**Response (200 OK):**
```json
{
  "attendance": [
    {
      "id": 1,
      "session_date": "2024-10-09",
      "marked_at": "2024-10-09T09:15:30",
      "status": "Present"
    },
    {
      "id": 5,
      "session_date": "2024-10-02",
      "marked_at": "2024-10-02T09:18:45",
      "status": "Present"
    }
  ]
}
```

---

### 6. Get Dashboard Statistics

**Endpoint:** `GET /api/student/dashboard/stats`

**Authentication:** Required (Student)

**Response (200 OK):**
```json
{
  "profile": {
    "id": 1,
    "student_id": "STU2024001",
    "full_name": "Rahul Sharma",
    "branch": "Computer Science",
    "semester": 6,
    "cgpa": 8.5,
    "backlogs": 0,
    "total_fee": 50000.0,
    "paid_fee": 50000.0,
    "fee_status": "Paid"
  },
  "attendance": {
    "total_sessions": 20,
    "present": 18,
    "percentage": 90.0
  },
  "subject_wise_attendance": [
    {
      "subject": "Data Structures",
      "total_sessions": 5,
      "present": 5,
      "percentage": 100.0
    },
    {
      "subject": "Database Management",
      "total_sessions": 5,
      "present": 4,
      "percentage": 80.0
    }
  ]
}
```

---

## Teacher Endpoints

### 1. Teacher Login

**Endpoint:** `POST /api/teacher/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "dr.sharma@college.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "id": 1,
    "teacher_id": "TCH2024001",
    "email": "dr.sharma@college.edu",
    "full_name": "Dr. Rajesh Sharma",
    "branch": "Computer Science",
    "designation": "Professor",
    "qualification": "Ph.D. in Computer Science",
    "specialization": "Data Structures and Algorithms"
  }
}
```

---

### 2. Get Teacher Profile

**Endpoint:** `GET /api/teacher/profile`

**Authentication:** Required (Teacher)

**Response (200 OK):**
```json
{
  "teacher": {
    "id": 1,
    "teacher_id": "TCH2024001",
    "email": "dr.sharma@college.edu",
    "full_name": "Dr. Rajesh Sharma",
    "branch": "Computer Science",
    "designation": "Professor",
    "qualification": "Ph.D. in Computer Science",
    "phone": "9998887770",
    "gender": "Male",
    "joining_date": "2010-07-01",
    "experience_years": 14,
    "specialization": "Data Structures and Algorithms",
    "achievements": null
  }
}
```

---

### 3. Get All Sessions

**Endpoint:** `GET /api/teacher/sessions`

**Authentication:** Required (Teacher)

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": 1,
      "session_id": "SES202410091a2b3c4d",
      "teacher_id": 1,
      "subject": "Data Structures",
      "branch": "Computer Science",
      "semester": 6,
      "session_date": "2024-10-09",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "is_active": false,
      "total_students": 30,
      "present_count": 28
    }
  ]
}
```

---

### 4. Get Session Attendance

**Endpoint:** `GET /api/teacher/session/<session_id>/attendance`

**Authentication:** Required (Teacher)

**Example:** `GET /api/teacher/session/1/attendance`

**Response (200 OK):**
```json
{
  "session": {
    "id": 1,
    "session_id": "SES202410091a2b3c4d",
    "subject": "Data Structures",
    "session_date": "2024-10-09",
    "total_students": 30,
    "present_count": 28
  },
  "attendance": [
    {
      "attendance_id": 1,
      "student_id": "STU2024001",
      "student_name": "Rahul Sharma",
      "status": "Present",
      "marked_at": "2024-10-09T09:15:30"
    },
    {
      "attendance_id": 2,
      "student_id": "STU2024002",
      "student_name": "Priya Patel",
      "status": "Present",
      "marked_at": "2024-10-09T09:16:45"
    }
  ],
  "total_present": 28
}
```

---

### 5. Get/Create Lesson Plans

**Endpoint:** `GET /api/teacher/lesson-plans` (Get)

**Endpoint:** `POST /api/teacher/lesson-plans` (Create)

**Authentication:** Required (Teacher)

**GET Response (200 OK):**
```json
{
  "lesson_plans": [
    {
      "id": 1,
      "teacher_id": 1,
      "subject": "Data Structures",
      "topic": "Binary Trees",
      "branch": "Computer Science",
      "semester": 6,
      "lesson_date": "2024-10-10",
      "duration_minutes": 90,
      "objectives": "Understand binary tree concepts",
      "content": "Introduction to binary trees...",
      "resources": "Textbook Chapter 5"
    }
  ]
}
```

**POST Request Body:**
```json
{
  "subject": "Data Structures",
  "topic": "Binary Trees",
  "branch": "Computer Science",
  "semester": 6,
  "lesson_date": "2024-10-10",
  "duration_minutes": 90,
  "objectives": "Understand binary tree concepts",
  "content": "Introduction to binary trees...",
  "resources": "Textbook Chapter 5"
}
```

---

### 6. Get Dashboard Statistics

**Endpoint:** `GET /api/teacher/dashboard/stats`

**Authentication:** Required (Teacher)

**Response (200 OK):**
```json
{
  "profile": {
    "id": 1,
    "teacher_id": "TCH2024001",
    "full_name": "Dr. Rajesh Sharma",
    "branch": "Computer Science",
    "designation": "Professor"
  },
  "statistics": {
    "total_sessions": 25,
    "active_sessions": 1
  },
  "subject_stats": [
    {
      "subject": "Data Structures",
      "total_sessions": 10,
      "attendance_rate": 92.5
    },
    {
      "subject": "Algorithms",
      "total_sessions": 15,
      "attendance_rate": 88.3
    }
  ],
  "recent_sessions": [...]
}
```

---

## Attendance Endpoints

### 1. Create Session

**Endpoint:** `POST /api/attendance/create-session`

**Authentication:** Required (Teacher)

**Request Body:**
```json
{
  "subject": "Data Structures",
  "branch": "Computer Science",
  "semester": 6,
  "total_students": 30
}
```

**Response (201 Created):**
```json
{
  "message": "Session created successfully",
  "session": {
    "id": 1,
    "session_id": "SES202410091a2b3c4d",
    "teacher_id": 1,
    "subject": "Data Structures",
    "branch": "Computer Science",
    "semester": 6,
    "session_date": "2024-10-09",
    "start_time": "09:00:00",
    "is_active": true,
    "total_students": 30,
    "present_count": 0
  }
}
```

---

### 2. Generate QR Code

**Endpoint:** `GET /api/attendance/generate-qr/<session_id>`

**Authentication:** Required (Teacher)

**Example:** `GET /api/attendance/generate-qr/1`

**Response (200 OK):**
```json
{
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qr_data": "{\"teacher_id\":1,\"session_id\":\"SES202410091a2b3c4d\",\"session_db_id\":1,\"token\":\"abc123xyz789...\",\"timestamp\":\"2024-10-09T09:00:00\",\"expires_at\":\"2024-10-09T09:00:06\"}",
  "expires_at": "2024-10-09T09:00:06",
  "session_id": "SES202410091a2b3c4d",
  "subject": "Data Structures"
}
```

---

### 3. Mark Attendance

**Endpoint:** `POST /api/attendance/mark`

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "qr_data": "{\"teacher_id\":1,\"session_id\":\"SES202410091a2b3c4d\",\"session_db_id\":1,\"token\":\"abc123xyz789...\",\"timestamp\":\"2024-10-09T09:00:00\",\"expires_at\":\"2024-10-09T09:00:06\"}",
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

**Response (200 OK):**
```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "id": 1,
    "student_id": 1,
    "session_id": 1,
    "teacher_id": 1,
    "marked_at": "2024-10-09T09:00:03",
    "status": "Present"
  },
  "session": {
    "subject": "Data Structures",
    "date": "2024-10-09"
  }
}
```

---

### 4. End Session

**Endpoint:** `POST /api/attendance/session/<session_id>/end`

**Authentication:** Required (Teacher)

**Example:** `POST /api/attendance/session/1/end`

**Response (200 OK):**
```json
{
  "message": "Session ended successfully",
  "session": {
    "id": 1,
    "session_id": "SES202410091a2b3c4d",
    "is_active": false,
    "end_time": "10:30:00",
    "present_count": 28,
    "total_students": 30
  }
}
```

---

### 5. Get Session Statistics

**Endpoint:** `GET /api/attendance/session/<session_id>/stats`

**Authentication:** Required (Teacher)

**Example:** `GET /api/attendance/session/1/stats`

**Response (200 OK):**
```json
{
  "session": {
    "id": 1,
    "session_id": "SES202410091a2b3c4d",
    "subject": "Data Structures",
    "session_date": "2024-10-09",
    "is_active": true
  },
  "present_count": 28,
  "total_students": 30,
  "attendance_percentage": 93.33,
  "is_active": true
}
```

---

### 6. Get Attendance Report

**Endpoint:** `GET /api/attendance/report`

**Authentication:** Required (Teacher)

**Query Parameters:**
- `session_id` (optional) - Filter by session ID
- `branch` (optional) - Filter by branch
- `subject` (optional) - Filter by subject

**Example:** `GET /api/attendance/report?subject=Data%20Structures&branch=Computer%20Science`

**Response (200 OK):**
```json
{
  "report": [
    {
      "session_id": "SES202410091a2b3c4d",
      "subject": "Data Structures",
      "session_date": "2024-10-09",
      "student_id": "STU2024001",
      "student_name": "Rahul Sharma",
      "branch": "Computer Science",
      "status": "Present",
      "marked_at": "2024-10-09T09:00:03"
    },
    {
      "session_id": "SES202410091a2b3c4d",
      "subject": "Data Structures",
      "session_date": "2024-10-09",
      "student_id": "STU2024002",
      "student_name": "Priya Patel",
      "branch": "Computer Science",
      "status": "Present",
      "marked_at": "2024-10-09T09:00:45"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Token is missing"
}
```

or

```json
{
  "error": "Token is invalid or expired"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for all `/api/*` endpoints with origin `*`. For production, configure specific allowed origins.

## Pagination

Currently, no pagination is implemented. All records are returned. For production, implement pagination for large datasets.

---

## Testing with Postman/curl

### Example: Student Registration

```bash
curl -X POST http://localhost:5000/api/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "STU2024001",
    "full_name": "Rahul Sharma",
    "email": "rahul.sharma@gmail.com",
    "password": "student123",
    "branch": "Computer Science",
    "semester": 6,
    "year": 2024
  }'
```

### Example: Student Login

```bash
curl -X POST http://localhost:5000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul.sharma@gmail.com",
    "password": "student123"
  }'
```

### Example: Get Profile (with Auth)

```bash
curl -X GET http://localhost:5000/api/student/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Versioning

Current API version: **v1** (implicit in base URL)

Future versions may use explicit versioning: `/api/v2/...`

---

**Last Updated:** October 2024

