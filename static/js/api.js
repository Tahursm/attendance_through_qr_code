// API Configuration
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

// Helper function to get auth token
function getAuthToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('getAuthToken: No token found in localStorage');
            // Check if we're in a context where localStorage might not be available
            if (typeof(Storage) === "undefined") {
                console.error('localStorage is not supported');
            }
        }
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

// Helper function to get user type
function getUserType() {
    return localStorage.getItem('userType');
}

// Helper function to decode JWT token and get user_type from payload
function decodeTokenPayload(token) {
    try {
        if (!token) return null;
        
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT format');
            return null;
        }
        
        // Decode payload (second part)
        const payload = parts[1];
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = JSON.parse(atob(paddedPayload));
        
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding token payload:', error);
        return null;
    }
}

// Helper function to get user_type from token itself (not localStorage)
function getTokenUserType() {
    try {
        const token = getAuthToken();
        if (!token) return null;
        
        const payload = decodeTokenPayload(token);
        if (!payload) return null;
        
        return payload.user_type || null;
    } catch (error) {
        console.error('Error getting user type from token:', error);
        return null;
    }
}

// Helper function to validate token matches expected user type
function validateTokenUserType(expectedType) {
    const tokenUserType = getTokenUserType();
    const localStorageUserType = getUserType();
    
    console.log('Token validation:', {
        expectedType: expectedType,
        tokenUserType: tokenUserType,
        localStorageUserType: localStorageUserType,
        match: tokenUserType === expectedType
    });
    
    // Check if token's user_type matches expected type
    if (tokenUserType !== expectedType) {
        console.error('Token user_type mismatch!', {
            expected: expectedType,
            actual: tokenUserType,
            localStorageSays: localStorageUserType
        });
        return false;
    }
    
    // Also check localStorage matches (secondary check)
    if (localStorageUserType !== expectedType) {
        console.warn('localStorage userType does not match expected type', {
            expected: expectedType,
            localStorage: localStorageUserType
        });
        // This is less critical, but we should sync it
        localStorage.setItem('userType', expectedType);
    }
    
    return true;
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        // Try multiple times to get token (in case of timing issues)
        let token = getAuthToken();
        
        // If token is null, try direct localStorage access
        if (!token) {
            console.warn('getAuthToken() returned null, trying direct localStorage access');
            try {
                token = localStorage.getItem('token');
            } catch (e) {
                console.error('Error accessing localStorage directly:', e);
            }
        }
        
        if (!token) {
            console.error('API call requires auth but no token found', {
                getAuthTokenResult: getAuthToken(),
                directLocalStorage: localStorage.getItem('token'),
                userType: getUserType(),
                localStorageAvailable: typeof(Storage) !== "undefined"
            });
            throw new Error('Authentication required. Please login again.');
        }
        
        // CRITICAL: Validate token user_type before making API call for teacher endpoints
        const teacherEndpoints = [
            '/attendance/create-session',
            '/attendance/generate-qr/',
            '/attendance/session/',
            '/attendance/report',
            '/teacher/'
        ];
        
        const isTeacherEndpoint = teacherEndpoints.some(pattern => endpoint.includes(pattern));
        
        if (isTeacherEndpoint) {
            let tokenUserType;
            try {
                tokenUserType = getTokenUserType();
            } catch (error) {
                console.error('Error getting token user type:', error);
                tokenUserType = null;
            }
            
            console.log('🔒 Validating token for teacher endpoint:', {
                endpoint: endpoint,
                tokenUserType: tokenUserType,
                localStorageUserType: getUserType(),
                isTeacherEndpoint: isTeacherEndpoint
            });
            
            // Check if token user_type is NOT 'teacher' (including null, undefined, or 'student')
            if (tokenUserType !== 'teacher') {
                const errorMsg = `CRITICAL: Token mismatch detected! Token is for "${tokenUserType || 'unknown'}" but endpoint requires "teacher".`;
                console.error('🚨 ' + errorMsg, {
                    endpoint: endpoint,
                    tokenUserType: tokenUserType,
                    expected: 'teacher',
                    localStorageUserType: getUserType(),
                    tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
                    fullToken: token // For debugging only
                });
                
                clearAuthData();
                
                // Don't redirect if we're already on login page
                if (window.location.pathname !== '/') {
                    if (!window.__authErrorHandled) {
                        window.__authErrorHandled = true;
                        alert('Authentication Error:\n\nYour token is for a ' + (tokenUserType || 'unknown') + ' account, but this action requires teacher access.\n\nPlease log out and login again as a teacher.');
                        window.location.href = '/';
                        // Return early to prevent the API call
                        return Promise.reject(new Error('Token validation failed: ' + errorMsg));
                    }
                }
                
                throw new Error('Token is for ' + (tokenUserType || 'unknown') + ' account, but teacher access is required. Please login as a teacher.');
            }
            
            console.log('✅ Token validation passed - token is for teacher');
        }
        
        // CRITICAL: Validate token user_type before making API call for student endpoints
        const studentEndpoints = [
            '/attendance/mark',
            '/student/'
        ];
        
        const isStudentEndpoint = studentEndpoints.some(pattern => endpoint.includes(pattern));
        
        if (isStudentEndpoint) {
            let tokenUserType;
            try {
                tokenUserType = getTokenUserType();
            } catch (error) {
                console.error('Error getting token user type:', error);
                tokenUserType = null;
            }
            
            console.log('🔒 Validating token for student endpoint:', {
                endpoint: endpoint,
                tokenUserType: tokenUserType,
                localStorageUserType: getUserType(),
                isStudentEndpoint: isStudentEndpoint
            });
            
            // Check if token user_type is NOT 'student' (including null, undefined, or 'teacher')
            if (tokenUserType !== 'student') {
                const errorMsg = `CRITICAL: Token mismatch detected! Token is for "${tokenUserType || 'unknown'}" but endpoint requires "student".`;
                console.error('🚨 ' + errorMsg, {
                    endpoint: endpoint,
                    tokenUserType: tokenUserType,
                    expected: 'student',
                    localStorageUserType: getUserType(),
                    tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
                });
                
                clearAuthData();
                
                // Don't redirect if we're already on login page
                if (window.location.pathname !== '/') {
                    if (!window.__authErrorHandled) {
                        window.__authErrorHandled = true;
                        alert('Authentication Error:\n\nYour token is for a ' + (tokenUserType || 'unknown') + ' account, but this action requires student access.\n\nPlease log out and login again as a student.');
                        window.location.href = '/';
                        // Return early to prevent the API call
                        return Promise.reject(new Error('Token validation failed: ' + errorMsg));
                    }
                }
                
                throw new Error('Token is for ' + (tokenUserType || 'unknown') + ' account, but student access is required. Please login as a student.');
            }
            
            console.log('✅ Token validation passed - token is for student');
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
        const fullUrl = `${API_BASE_URL}${endpoint}`;
        
        console.log(`Making API call: ${method} ${fullUrl}`, { 
            requiresAuth, 
            hasAuthHeader: !!headers['Authorization'],
            userType: getUserType(),
            hasBody: !!body
        });
        
        let response;
        try {
            response = await fetch(fullUrl, options);
        } catch (fetchError) {
            console.error('Fetch error (network/CORS issue):', fetchError);
            const networkError = new Error(`Network error: ${fetchError.message || 'Could not connect to server. Please check if the server is running and accessible.'}`);
            networkError.name = fetchError.name || 'NetworkError';
            throw networkError;
        }
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            let errorData;
            try {
                const text = await response.text();
                errorData = text ? JSON.parse(text) : { error: `Server error: ${response.status} ${response.statusText}` };
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
                errorData = { error: `Server error: ${response.status} ${response.statusText}` };
            }
            
            console.error(`API call failed: ${response.status}`, errorData);
            console.error('Full error details:', {
                endpoint: endpoint,
                method: method,
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            
            // Handle service unavailable errors (503)
            if (response.status === 503) {
                console.error('Service unavailable error detected:', {
                    status: response.status,
                    error: errorData.error,
                    details: errorData.details,
                    database: errorData.database
                });
                
                // Construct a user-friendly error message
                let serviceErrorMessage = 'Service temporarily unavailable. ';
                if (errorData.details) {
                    serviceErrorMessage += errorData.details;
                } else if (errorData.error === 'Database connection failed') {
                    serviceErrorMessage += 'The database server is not accessible. Please check if the database is running.';
                } else {
                    serviceErrorMessage += 'The server is currently unable to handle your request. Please try again later.';
                }
                
                throw new Error(serviceErrorMessage);
            }
            
            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication error detected:', {
                    status: response.status,
                    error: errorData.error,
                    details: errorData.details,
                    currentToken: token ? token.substring(0, 20) + '...' : 'NONE',
                    currentUserType: getUserType()
                });
                
                // Clear token if it's invalid, expired, or user type mismatch
                const isUserTypeMismatch = errorData.details && (
                    errorData.details.includes('requires') && errorData.details.includes('access') ||
                    errorData.details.includes('token is for')
                );
                
                const shouldClearToken = 
                    (errorData.error && (
                        errorData.error.toLowerCase().includes('invalid') || 
                        errorData.error.toLowerCase().includes('expired') ||
                        errorData.error.toLowerCase().includes('unauthorized')
                    )) ||
                    isUserTypeMismatch;
                
                if (shouldClearToken) {
                    console.error('Clearing auth data due to authentication error', {
                        error: errorData.error,
                        details: errorData.details,
                        isUserTypeMismatch: isUserTypeMismatch
                    });
                    clearAuthData();
                    
                    // Redirect to login if unauthorized
                    if (window.location.pathname !== '/') {
                        const errorMsg = errorData.error + (errorData.details ? ': ' + errorData.details : '');
                        console.error('Redirecting to login due to auth error:', errorMsg);
                        
                        // Don't show alert if we're already redirecting to avoid multiple alerts
                        if (!window.__authErrorHandled) {
                            window.__authErrorHandled = true;
                            alert(errorMsg + '\nPlease login again with the correct account type.');
                            window.location.href = '/';
                        }
                    }
                }
            }
            
            // Construct error message
            let errorMessage = errorData.error || errorData.message;
            if (!errorMessage || errorMessage.trim() === '') {
                errorMessage = `Request failed with status ${response.status}`;
            }
            const errorDetails = errorData.details ? ': ' + errorData.details : '';
            const finalErrorMessage = errorMessage + errorDetails;
            
            console.error('Throwing error:', finalErrorMessage);
            throw new Error(finalErrorMessage);
        }
        
        let data;
        try {
            const text = await response.text();
            if (text) {
                data = JSON.parse(text);
            } else {
                data = {};
            }
            console.log(`API call successful: ${method} ${endpoint}`, { hasData: !!data });
            return data;
        } catch (parseError) {
            console.error('Failed to parse response JSON:', parseError);
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', {
            endpoint,
            method,
            message: error?.message,
            error: error?.error,
            name: error?.name,
            stack: error?.stack,
            errorType: typeof error,
            errorString: String(error)
        });
        
        // If it's a network error or fetch failed, provide a better message
        if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
            throw new Error('Network error: Could not connect to server. Please check your internet connection.');
        }
        
        // Extract error message from various formats
        let errorMessage = null;
        if (error?.message) {
            errorMessage = error.message;
        } else if (error?.error) {
            errorMessage = error.error;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.toString && error.toString() !== '[object Object]') {
            errorMessage = error.toString();
        }
        
        // If we still don't have a message, create a descriptive one
        if (!errorMessage || errorMessage.trim() === '') {
            errorMessage = `Request failed: ${endpoint} - ${error?.name || 'Unknown error'}`;
        }
        
        // Create a new error with the extracted message
        const finalError = new Error(errorMessage);
        if (error?.stack) {
            finalError.stack = error.stack;
        }
        throw finalError;
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
    console.log('saveAuthData called with:', { 
        hasToken: !!token, 
        tokenType: typeof token,
        tokenLength: token?.length || 0,
        userType: userType,
        hasUserData: !!userData 
    });
    
    if (!token || !userType || !userData) {
        console.error('saveAuthData: Missing required parameters', { 
            token: !!token, 
            userType: !!userType, 
            userData: !!userData,
            tokenValue: token,
            userTypeValue: userType,
            userDataValue: userData
        });
        return false;
    }
    
    try {
        // Check if localStorage is available
        if (typeof(Storage) === "undefined") {
            console.error('localStorage is not supported in this browser');
            return false;
        }
        
        // Save to localStorage
        localStorage.setItem('token', String(token)); // Ensure it's a string
        localStorage.setItem('userType', String(userType));
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Verify it was saved
        const verifyToken = localStorage.getItem('token');
        const verifyUserType = localStorage.getItem('userType');
        
        if (!verifyToken || verifyToken !== String(token)) {
            console.error('Token verification failed!', {
                expected: token,
                got: verifyToken
            });
            return false;
        }
        
        console.log('Auth data saved successfully:', { 
            userType, 
            hasUserData: !!userData, 
            userId: userData.student_id || userData.teacher_id,
            tokenSaved: !!verifyToken,
            userTypeSaved: verifyUserType
        });
        
        return true;
    } catch (error) {
        console.error('Error saving auth data to localStorage:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return false;
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

// Debug function to check token status (can be called from console)
function checkTokenStatus() {
    const token = getAuthToken();
    const localStorageUserType = getUserType();
    const tokenUserType = getTokenUserType();
    const tokenPayload = token ? decodeTokenPayload(token) : null;
    
    console.log('=== TOKEN STATUS CHECK ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('localStorage userType:', localStorageUserType);
    console.log('Token user_type (from JWT):', tokenUserType);
    console.log('Token payload:', tokenPayload);
    console.log('Status:', tokenUserType === localStorageUserType ? '✓ MATCH' : '✗ MISMATCH!');
    
    if (tokenUserType && localStorageUserType && tokenUserType !== localStorageUserType) {
        console.error('⚠️ WARNING: Token and localStorage userType do not match!');
        console.error('Token says:', tokenUserType);
        console.error('localStorage says:', localStorageUserType);
        console.log('Recommendation: Run localStorage.clear() and login again');
    }
    
    return {
        token: token,
        localStorageUserType: localStorageUserType,
        tokenUserType: tokenUserType,
        payload: tokenPayload,
        match: tokenUserType === localStorageUserType
    };
}

