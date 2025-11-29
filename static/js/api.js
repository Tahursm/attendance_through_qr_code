// API Configuration
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to get user type
function getUserType() {
    return localStorage.getItem('userType');
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = getAuthToken();
        if (!token) {
            console.error('API call requires auth but no token found');
            throw new Error('Authentication required');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`Making API call: ${method} ${endpoint}`, { requiresAuth, hasToken: !!getAuthToken() });
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`API call failed: ${response.status}`, errorData);
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`API call successful: ${method} ${endpoint}`, { hasData: !!data });
        return data;
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', {
            endpoint,
            method,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Student API calls
const StudentAPI = {
    register: (data) => apiCall('/student/register', 'POST', data),
    login: (data) => apiCall('/student/login', 'POST', data),
    getProfile: () => apiCall('/student/profile', 'GET', null, true),
    getAttendance: () => apiCall('/student/attendance', 'GET', null, true),
    getDashboardStats: () => apiCall('/student/dashboard/stats', 'GET', null, true),
    getAttendanceBySubject: (subject) => apiCall(`/student/attendance/subject/${subject}`, 'GET', null, true)
};

// Teacher API calls
const TeacherAPI = {
    login: (data) => apiCall('/teacher/login', 'POST', data),
    getProfile: () => apiCall('/teacher/profile', 'GET', null, true),
    getSessions: () => apiCall('/teacher/sessions', 'GET', null, true),
    getSessionAttendance: (sessionId) => apiCall(`/teacher/session/${sessionId}/attendance`, 'GET', null, true),
    getDashboardStats: () => apiCall('/teacher/dashboard/stats', 'GET', null, true),
    getLessonPlans: () => apiCall('/teacher/lesson-plans', 'GET', null, true),
    createLessonPlan: (data) => apiCall('/teacher/lesson-plans', 'POST', data, true)
};

// Attendance API calls
const AttendanceAPI = {
    createSession: (data) => apiCall('/attendance/create-session', 'POST', data, true),
    generateQR: (sessionId) => apiCall(`/attendance/generate-qr/${sessionId}`, 'GET', null, true),
    markAttendance: (data) => apiCall('/attendance/mark', 'POST', data, true),
    endSession: (sessionId) => apiCall(`/attendance/session/${sessionId}/end`, 'POST', null, true),
    getSessionStats: (sessionId) => apiCall(`/attendance/session/${sessionId}/stats`, 'GET', null, true),
    getReport: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/attendance/report?${queryString}`, 'GET', null, true);
    }
};

// Show alert message
function showAlert(elementId, message, type = 'danger') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// Save auth data to localStorage
function saveAuthData(token, userType, userData) {
    if (!token || !userType || !userData) {
        console.error('saveAuthData: Missing required parameters', { token: !!token, userType: !!userType, userData: !!userData });
        return;
    }
    
    try {
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Auth data saved successfully:', { userType, hasUserData: !!userData, studentId: userData.student_id || userData.teacher_id });
    } catch (error) {
        console.error('Error saving auth data to localStorage:', error);
    }
}

// Get user data from localStorage
function getUserData() {
    try {
        const data = localStorage.getItem('userData');
        if (!data) {
            console.warn('No userData found in localStorage');
            return null;
        }
        
        const parsed = JSON.parse(data);
        
        // Validate that we have essential fields
        if (!parsed || (typeof parsed !== 'object')) {
            console.error('Invalid userData format in localStorage');
            return null;
        }
        
        // Check if it's student or teacher data
        const hasStudentFields = parsed.student_id && parsed.full_name && parsed.email;
        const hasTeacherFields = parsed.teacher_id && parsed.full_name && parsed.email;
        
        if (!hasStudentFields && !hasTeacherFields) {
            console.error('UserData missing essential fields:', parsed);
            return null;
        }
        
        console.log('Retrieved user data from localStorage:', { 
            hasData: !!parsed, 
            studentId: parsed.student_id || parsed.teacher_id,
            fullName: parsed.full_name,
            email: parsed.email
        });
        
        return parsed;
    } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        console.error('Raw data:', localStorage.getItem('userData'));
        return null;
    }
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Logout function
function logout() {
    clearAuthData();
    window.location.href = '/';
}

