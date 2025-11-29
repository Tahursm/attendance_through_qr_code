# 📊 Database ER Diagram & Schema

## Entity-Relationship Diagram

```
┌─────────────────────────────┐
│        STUDENTS             │
├─────────────────────────────┤
│ PK id                       │
│ UK student_id               │
│ UK email                    │
│    password_hash            │
│    full_name                │
│    branch                   │
│    semester                 │
│    year                     │
│    phone                    │
│    address                  │
│    date_of_birth            │
│    gender                   │
│    admission_date           │
│    fee_status               │
│    total_fee                │
│    paid_fee                 │
│    backlogs                 │
│    cgpa                     │
│    created_at               │
│    updated_at               │
└──────────┬──────────────────┘
           │
           │ 1
           │
           │ N
           │
┌──────────▼──────────────────┐
│      ATTENDANCE             │
├─────────────────────────────┤
│ PK id                       │
│ FK student_id               │────┐
│ FK session_id               │────┼─┐
│ FK teacher_id               │────┼─┼─┐
│    marked_at                │    │ │ │
│    status                   │    │ │ │
│    latitude                 │    │ │ │
│    longitude                │    │ │ │
│    ip_address               │    │ │ │
└─────────────────────────────┘    │ │ │
                                   │ │ │
                                   │ │ │
           ┌───────────────────────┘ │ │
           │                         │ │
           │ N                       │ │
           │                         │ │
           │ 1                       │ │
           │                         │ │
┌──────────▼──────────────────┐     │ │
│       SESSIONS              │     │ │
├─────────────────────────────┤     │ │
│ PK id                       │     │ │
│ UK session_id               │     │ │
│ FK teacher_id               │◄────┼─┘
│    subject                  │     │
│    branch                   │     │
│    semester                 │     │
│    session_date             │     │
│    start_time               │     │
│    end_time                 │     │
│    qr_token                 │     │
│    token_generated_at       │     │
│    token_expires_at         │     │
│    is_active                │     │
│    total_students           │     │
│    present_count            │     │
│    created_at               │     │
└──────────┬──────────────────┘     │
           │                        │
           │ N                      │
           │                        │
           │ 1                      │
           │                        │
┌──────────▼──────────────────┐     │
│        TEACHERS             │     │
├─────────────────────────────┤     │
│ PK id                       │◄────┘
│ UK teacher_id               │
│ UK email                    │
│    password_hash            │
│    full_name                │
│    branch                   │
│    designation              │
│    qualification            │
│    phone                    │
│    address                  │
│    date_of_birth            │
│    gender                   │
│    joining_date             │
│    experience_years         │
│    specialization           │
│    achievements             │
│    created_at               │
│    updated_at               │
└──────────┬──────────────────┘
           │
           │ 1
           │
           │ N
           │
┌──────────▼──────────────────┐
│      LESSON_PLANS           │
├─────────────────────────────┤
│ PK id                       │
│ FK teacher_id               │
│    subject                  │
│    topic                    │
│    branch                   │
│    semester                 │
│    lesson_date              │
│    duration_minutes         │
│    objectives               │
│    content                  │
│    resources                │
│    created_at               │
└─────────────────────────────┘
```

## Relationships

### 1. Students ↔ Attendance
- **Type:** One-to-Many
- **Description:** One student can have multiple attendance records
- **Foreign Key:** `attendance.student_id` references `students.id`
- **On Delete:** CASCADE (if student is deleted, all their attendance records are deleted)

### 2. Teachers ↔ Sessions
- **Type:** One-to-Many
- **Description:** One teacher can conduct multiple sessions
- **Foreign Key:** `sessions.teacher_id` references `teachers.id`
- **On Delete:** CASCADE (if teacher is deleted, all their sessions are deleted)

### 3. Sessions ↔ Attendance
- **Type:** One-to-Many
- **Description:** One session can have multiple attendance records
- **Foreign Key:** `attendance.session_id` references `sessions.id`
- **On Delete:** CASCADE (if session is deleted, all attendance records are deleted)

### 4. Teachers ↔ Attendance
- **Type:** One-to-Many
- **Description:** One teacher can have multiple attendance records (for tracking)
- **Foreign Key:** `attendance.teacher_id` references `teachers.id`
- **On Delete:** CASCADE

### 5. Teachers ↔ Lesson Plans
- **Type:** One-to-Many
- **Description:** One teacher can create multiple lesson plans
- **Foreign Key:** `lesson_plans.teacher_id` references `teachers.id`
- **On Delete:** CASCADE

## Constraints & Indexes

### Primary Keys (PK)
- All tables have an auto-incrementing integer `id` as primary key

### Unique Keys (UK)
- `students.student_id` - Unique student identifier
- `students.email` - Unique email per student
- `teachers.teacher_id` - Unique teacher identifier
- `teachers.email` - Unique email per teacher
- `sessions.session_id` - Unique session identifier
- `attendance(student_id, session_id)` - Composite unique constraint (student can mark attendance only once per session)

### Foreign Keys (FK)
- All foreign keys have `ON DELETE CASCADE` to maintain referential integrity

### Indexes
- `sessions.session_id` - For fast session lookup
- `sessions.teacher_id` - For fast teacher's sessions lookup
- `sessions.qr_token` - For fast QR token validation
- `attendance.student_id` - For fast student attendance lookup
- `attendance.session_id` - For fast session attendance lookup
- `attendance.teacher_id` - For fast teacher's attendance records

## Entity Descriptions

### STUDENTS Table
Stores all student information including academic and personal details.

**Key Fields:**
- `student_id`: Unique identifier (e.g., STU2024001)
- `email`: Login email (must be unique)
- `password_hash`: Bcrypt hashed password
- `branch`: Academic branch/department
- `semester`: Current semester (1-8)
- `fee_status`: Payment status (Paid/Pending/Partial)
- `cgpa`: Cumulative Grade Point Average
- `backlogs`: Number of backlog subjects

### TEACHERS Table
Stores teacher/faculty information and credentials.

**Key Fields:**
- `teacher_id`: Unique identifier (e.g., TCH2024001)
- `email`: Login email (must be unique)
- `password_hash`: Bcrypt hashed password
- `designation`: Position (Professor, Associate Professor, etc.)
- `qualification`: Educational qualification
- `experience_years`: Years of teaching experience
- `specialization`: Area of expertise

### SESSIONS Table
Stores attendance session information and QR token details.

**Key Fields:**
- `session_id`: Unique session identifier (e.g., SES202410091a2b3c4d)
- `teacher_id`: Foreign key to teachers table
- `subject`: Subject name
- `branch`: Target branch
- `semester`: Target semester
- `qr_token`: Current QR code token (changes every 6 seconds)
- `token_generated_at`: When token was generated
- `token_expires_at`: When token expires (generated_at + 6 seconds)
- `is_active`: Whether session is currently active
- `present_count`: Real-time count of present students

### ATTENDANCE Table
Stores individual attendance records with timestamp and location.

**Key Fields:**
- `student_id`: Foreign key to students table
- `session_id`: Foreign key to sessions table
- `teacher_id`: Foreign key to teachers table
- `marked_at`: Exact timestamp when attendance was marked
- `status`: Attendance status (Present/Absent/Late)
- `latitude`, `longitude`: Optional geolocation data
- `ip_address`: IP address from which attendance was marked

**Unique Constraint:** (student_id, session_id) - Prevents duplicate attendance

### LESSON_PLANS Table
Stores teacher's lesson plans (optional feature).

**Key Fields:**
- `teacher_id`: Foreign key to teachers table
- `subject`: Subject name
- `topic`: Lesson topic
- `lesson_date`: Scheduled date
- `objectives`: Learning objectives
- `content`: Lesson content
- `resources`: Required resources

## Sample Queries

### Get Student Attendance Percentage
```sql
SELECT 
    s.full_name,
    COUNT(a.id) as total_sessions,
    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
    (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id) * 100) as percentage
FROM students s
JOIN attendance a ON s.id = a.student_id
WHERE s.student_id = 'STU2024001'
GROUP BY s.id;
```

### Get Subject-wise Attendance
```sql
SELECT 
    ses.subject,
    COUNT(a.id) as total_sessions,
    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count
FROM attendance a
JOIN sessions ses ON a.session_id = ses.id
WHERE a.student_id = 1
GROUP BY ses.subject;
```

### Get Active Sessions for Teacher
```sql
SELECT 
    s.session_id,
    s.subject,
    s.branch,
    s.semester,
    s.present_count,
    s.total_students
FROM sessions s
WHERE s.teacher_id = 1 AND s.is_active = TRUE;
```

### Get Session Attendance List
```sql
SELECT 
    st.student_id,
    st.full_name,
    a.status,
    a.marked_at
FROM attendance a
JOIN students st ON a.student_id = st.id
WHERE a.session_id = 1
ORDER BY a.marked_at;
```

### Validate QR Token
```sql
SELECT 
    s.id,
    s.session_id,
    s.qr_token,
    s.token_expires_at,
    s.is_active
FROM sessions s
WHERE s.id = 1 
  AND s.is_active = TRUE
  AND s.token_expires_at > NOW();
```

## Data Types

### MySQL Data Types Used

- `INT` - Integer values (IDs, counts)
- `VARCHAR(n)` - Variable-length strings
- `TEXT` - Long text (addresses, achievements)
- `DATE` - Date values (YYYY-MM-DD)
- `TIME` - Time values (HH:MM:SS)
- `TIMESTAMP` - Date and time with timezone
- `DATETIME` - Date and time
- `DECIMAL(p,s)` - Fixed-point numbers (fees, CGPA)
- `BOOLEAN` - True/False values
- `ENUM` - Enumerated values (status types)

## Normalization

The database follows **Third Normal Form (3NF)**:

1. **1NF:** All tables have atomic values and primary keys
2. **2NF:** All non-key attributes depend on the entire primary key
3. **3NF:** No transitive dependencies

## Security Considerations

### Password Storage
- Passwords are never stored in plain text
- Bcrypt hashing with salt (rounds: 12)
- Password hash length: 255 characters

### Token Security
- QR tokens are random 32-character strings
- Tokens expire after 6 seconds
- Unique constraint prevents token reuse
- Tokens nullified after session ends

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate data
- NOT NULL constraints on critical fields
- Cascade deletes maintain consistency

## Scalability Considerations

### Current Limitations
- No table partitioning
- All data in single database
- No read replicas

### Future Enhancements for Scale
1. **Partitioning:** Partition attendance table by date
2. **Archiving:** Move old records to archive tables
3. **Caching:** Use Redis for session data
4. **Sharding:** Distribute data by branch/year
5. **Read Replicas:** For report generation

## Backup Strategy

### Recommended Backups
1. **Daily Full Backup:** Complete database dump
2. **Hourly Incremental:** Changes only
3. **Transaction Logs:** Real-time recovery

### Backup Command
```bash
mysqldump -u root -p attendance_qr_db > backup_$(date +%Y%m%d).sql
```

### Restore Command
```bash
mysql -u root -p attendance_qr_db < backup_20241009.sql
```

---

**Database Version:** MySQL 8.0+  
**Last Updated:** October 2024

