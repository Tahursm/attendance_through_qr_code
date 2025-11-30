-- Create Database
CREATE DATABASE IF NOT EXISTS attendance_qr_db;
USE attendance_qr_db;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    year INT NOT NULL,
    division VARCHAR(10),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    admission_date DATE,
    fee_status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Pending',
    total_fee DECIMAL(10, 2) DEFAULT 0.00,
    paid_fee DECIMAL(10, 2) DEFAULT 0.00,
    backlogs INT DEFAULT 0,
    cgpa DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    designation VARCHAR(50),
    qualification VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    joining_date DATE,
    experience_years INT DEFAULT 0,
    specialization VARCHAR(100),
    achievements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions Table (for QR code tracking)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    division VARCHAR(10),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    qr_token VARCHAR(100),
    token_generated_at TIMESTAMP NULL,
    token_expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_students INT DEFAULT 0,
    present_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_token (qr_token)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    teacher_id INT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    ip_address VARCHAR(45),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, session_id),
    INDEX idx_student_id (student_id),
    INDEX idx_session_id (session_id),
    INDEX idx_teacher_id (teacher_id)
);

-- Lesson Plans Table (Optional - for teacher dashboard)
CREATE TABLE IF NOT EXISTS lesson_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    lesson_date DATE NOT NULL,
    duration_minutes INT,
    objectives TEXT,
    content TEXT,
    resources TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- WiFi Networks Table (for WiFi authentication)
CREATE TABLE IF NOT EXISTS wifi_networks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ssid VARCHAR(100) NOT NULL,
    bssid VARCHAR(50),
    location VARCHAR(200) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    room_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_ssid (ssid),
    INDEX idx_branch (branch)
);

-- Insert Sample Data for Testing

-- Sample Students (Indian Names with Plain Text Passwords)
-- Division A Students (10 students)
-- Password for all students: student123
INSERT INTO students (student_id, email, password_hash, full_name, branch, semester, year, division, phone, gender, admission_date, fee_status, total_fee, paid_fee, backlogs, cgpa) VALUES
('STU2024001', 'rahul.sharma@gmail.com', 'student123', 'Rahul Sharma', 'Computer Science', 6, 2024, 'Division A', '9876543210', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.5),
('STU2024002', 'priya.patel@gmail.com', 'student123', 'Priya Patel', 'Computer Science', 6, 2024, 'Division A', '9876543211', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 1, 7.8),
('STU2024003', 'arjun.kumar@gmail.com', 'student123', 'Arjun Kumar', 'Computer Science', 6, 2024, 'Division A', '9876543212', 'Male', '2021-08-01', 'Partial', 50000.00, 30000.00, 2, 7.2),
('STU2024004', 'ananya.singh@gmail.com', 'student123', 'Ananya Singh', 'Computer Science', 6, 2024, 'Division A', '9876543213', 'Female', '2021-08-01', 'Pending', 50000.00, 0.00, 0, 8.9),
('STU2024005', 'vishal.gupta@gmail.com', 'student123', 'Vishal Gupta', 'Computer Science', 6, 2024, 'Division A', '9876543214', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.2),
('STU2024006', 'kavya.reddy@gmail.com', 'student123', 'Kavya Reddy', 'Computer Science', 6, 2024, 'Division A', '9876543215', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 1, 7.5),
('STU2024007', 'rohan.malhotra@gmail.com', 'student123', 'Rohan Malhotra', 'Computer Science', 6, 2024, 'Division A', '9876543216', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.7),
('STU2024008', 'diya.jain@gmail.com', 'student123', 'Diya Jain', 'Computer Science', 6, 2024, 'Division A', '9876543217', 'Female', '2021-08-01', 'Partial', 50000.00, 25000.00, 0, 8.0),
('STU2024009', 'aditya.verma@gmail.com', 'student123', 'Aditya Verma', 'Computer Science', 6, 2024, 'Division A', '9876543218', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 2, 7.3),
('STU2024010', 'meera.shah@gmail.com', 'student123', 'Meera Shah', 'Computer Science', 6, 2024, 'Division A', '9876543219', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.4);

-- Division B Students (10 students)
-- Password for all students: student123
INSERT INTO students (student_id, email, password_hash, full_name, branch, semester, year, division, phone, gender, admission_date, fee_status, total_fee, paid_fee, backlogs, cgpa) VALUES
('STU2024011', 'karan.desai@gmail.com', 'student123', 'Karan Desai', 'Computer Science', 6, 2024, 'Division B', '9876543220', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.6),
('STU2024012', 'neha.mehta@gmail.com', 'student123', 'Neha Mehta', 'Computer Science', 6, 2024, 'Division B', '9876543221', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 1, 7.9),
('STU2024013', 'siddharth.agarwal@gmail.com', 'student123', 'Siddharth Agarwal', 'Computer Science', 6, 2024, 'Division B', '9876543222', 'Male', '2021-08-01', 'Partial', 50000.00, 40000.00, 0, 8.1),
('STU2024014', 'isha.bansal@gmail.com', 'student123', 'Isha Bansal', 'Computer Science', 6, 2024, 'Division B', '9876543223', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.8),
('STU2024015', 'aman.kapoor@gmail.com', 'student123', 'Aman Kapoor', 'Computer Science', 6, 2024, 'Division B', '9876543224', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 2, 7.4),
('STU2024016', 'tanvi.chopra@gmail.com', 'student123', 'Tanvi Chopra', 'Computer Science', 6, 2024, 'Division B', '9876543225', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.3),
('STU2024017', 'yash.tiwari@gmail.com', 'student123', 'Yash Tiwari', 'Computer Science', 6, 2024, 'Division B', '9876543226', 'Male', '2021-08-01', 'Partial', 50000.00, 35000.00, 1, 7.6),
('STU2024018', 'riya.bhatia@gmail.com', 'student123', 'Riya Bhatia', 'Computer Science', 6, 2024, 'Division B', '9876543227', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.5),
('STU2024019', 'harsh.saxena@gmail.com', 'student123', 'Harsh Saxena', 'Computer Science', 6, 2024, 'Division B', '9876543228', 'Male', '2021-08-01', 'Paid', 50000.00, 50000.00, 0, 8.2),
('STU2024020', 'pooja.mishra@gmail.com', 'student123', 'Pooja Mishra', 'Computer Science', 6, 2024, 'Division B', '9876543229', 'Female', '2021-08-01', 'Paid', 50000.00, 50000.00, 1, 7.7);

-- Sample Teachers (password: "password123" for all)
INSERT INTO teachers (teacher_id, email, password_hash, full_name, branch, designation, qualification, phone, gender, joining_date, experience_years, specialization) VALUES
('TCH2024001', 'dr.sharma@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJNvUw2wG', 'Dr. Rajesh Sharma', 'Computer Science', 'Professor', 'Ph.D. in Computer Science', '9998887770', 'Male', '2010-07-01', 14, 'Data Structures and Algorithms'),
('TCH2024002', 'prof.mehta@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJNvUw2wG', 'Prof. Priya Mehta', 'Computer Science', 'Associate Professor', 'M.Tech in Software Engineering', '9998887771', 'Female', '2015-08-01', 9, 'Database Management Systems'),
('TCH2024003', 'dr.kumar@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJNvUw2wG', 'Dr. Amit Kumar', 'Information Technology', 'Assistant Professor', 'Ph.D. in Information Technology', '9998887772', 'Male', '2018-06-15', 6, 'Machine Learning');

-- Sample Sessions
INSERT INTO sessions (session_id, teacher_id, subject, branch, semester, session_date, start_time, is_active, total_students) VALUES
('SES20241001', 1, 'Data Structures', 'Computer Science', 6, CURDATE(), '09:00:00', FALSE, 30),
('SES20241002', 2, 'Database Management', 'Computer Science', 6, CURDATE(), '11:00:00', FALSE, 28);

