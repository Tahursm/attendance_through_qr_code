// Student Login
async function studentLogin() {
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;

    if (!email || !password) {
        showAlert('studentLoginAlert', 'Please enter email and password', 'danger');
        return;
    }

    // Enhanced security: prevent role switching during authentication
    preventRoleSwitch();

    try {
        const response = await StudentAPI.login({ email, password });
        
        if (!response || !response.token) {
            showAlert('studentLoginAlert', 'Login failed: No response from server', 'danger');
            return;
        }
        
        saveAuthData(response.token, 'student', response.student);
        showAlert('studentLoginAlert', 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/student/dashboard';
        }, 1000);
    } catch (error) {
        console.error('Student login error:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error || {}));
        
        // Extract error message from various possible formats
        let errorMessage = 'Login failed. Please try again.';
        
        if (error) {
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.toString && error.toString() !== '[object Object]') {
                errorMessage = error.toString();
            }
        }
        
        console.error('Final error message:', errorMessage);
        showAlert('studentLoginAlert', errorMessage, 'danger');
    }
}

// Student Registration
async function studentRegister() {
    // Get form data
    const data = {
        student_id: document.getElementById('regStudentId').value,
        full_name: document.getElementById('regStudentName').value,
        email: document.getElementById('regStudentEmail').value,
        password: document.getElementById('regStudentPassword').value,
        branch: document.getElementById('regStudentBranch').value,
        semester: parseInt(document.getElementById('regStudentSemester').value),
        year: parseInt(document.getElementById('regStudentYear').value),
        phone: document.getElementById('regStudentPhone').value
    };

    // Basic validation
    if (!data.student_id || !data.full_name || !data.email || !data.password || !data.branch || !data.semester || !data.year) {
        showAlert('studentLoginAlert', 'Please fill all required fields', 'danger');
        return;
    }

    // Enhanced security: prevent role switching during authentication
    preventRoleSwitch();

    try {
        const response = await StudentAPI.register(data);
        saveAuthData(response.token, 'student', response.student);
        showAlert('studentLoginAlert', '✓ Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/student/dashboard';
        }, 1000);
    } catch (error) {
        console.error('Student login error:', error);
        const errorMessage = error.message || error.error || 'Login failed. Please check your credentials.';
        showAlert('studentLoginAlert', errorMessage, 'danger');
    }
}

// Teacher Login
async function teacherLogin() {
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;

    if (!email || !password) {
        showAlert('teacherLoginAlert', 'Please enter email and password', 'danger');
        return;
    }

    // Enhanced security: prevent role switching during authentication
    preventRoleSwitch();

    try {
        const response = await TeacherAPI.login({ email, password });
        
        // Debug: Log the response
        console.log('Teacher login response:', response);
        console.log('Token in response:', response.token);
        console.log('Teacher data in response:', response.teacher);
        
        // Verify response has required data
        if (!response.token) {
            console.error('No token in login response!', response);
            showAlert('teacherLoginAlert', 'Login failed: No token received from server', 'danger');
            return;
        }
        
        if (!response.teacher) {
            console.error('No teacher data in login response!', response);
            showAlert('teacherLoginAlert', 'Login failed: No user data received from server', 'danger');
            return;
        }
        
        // Save auth data
        saveAuthData(response.token, 'teacher', response.teacher);
        
        // Verify it was saved
        const savedToken = localStorage.getItem('token');
        const savedUserType = localStorage.getItem('userType');
        console.log('Token saved verification:', { 
            tokenSaved: !!savedToken, 
            tokenLength: savedToken?.length || 0,
            userTypeSaved: savedUserType 
        });
        
        if (!savedToken) {
            console.error('Token was not saved to localStorage!');
            showAlert('teacherLoginAlert', 'Login failed: Could not save authentication token', 'danger');
            return;
        }
        
        showAlert('teacherLoginAlert', 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/teacher/dashboard';
        }, 1000);
    } catch (error) {
        console.error('Teacher login error:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error || {}));
        
        // Extract error message from various possible formats
        let errorMessage = 'Login failed. Please try again.';
        
        if (error) {
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.toString && error.toString() !== '[object Object]') {
                errorMessage = error.toString();
            }
        }
        
        console.error('Final error message:', errorMessage);
        showAlert('teacherLoginAlert', errorMessage, 'danger');
    }
}

// Toggle between login and register forms
function showStudentRegister() {
    document.getElementById('studentLoginForm').classList.add('hidden');
    document.getElementById('studentRegisterForm').classList.remove('hidden');
    document.getElementById('studentLoginAlert').innerHTML = '';
    
    // Enable the register button
    const registerBtn = document.getElementById('studentRegisterBtn');
    if (registerBtn) {
        registerBtn.disabled = false;
    }
}

function showStudentLogin() {
    document.getElementById('studentRegisterForm').classList.add('hidden');
    document.getElementById('studentLoginForm').classList.remove('hidden');
    document.getElementById('studentLoginAlert').innerHTML = '';
}

// Enhanced security: prevent role switching during authentication
function preventRoleSwitch() {
    // This function is called from the main index.html script
    // It prevents users from switching roles during authentication
    if (typeof currentRole !== 'undefined' && currentRole) {
        // Disable the other role's card completely
        const otherCard = currentRole === 'student' ? 
            document.getElementById('teacherCard') : 
            document.getElementById('studentCard');
        if (otherCard) {
            otherCard.style.display = 'none';
            otherCard.style.pointerEvents = 'none';
        }
    }
}

// Allow Enter key to submit forms
document.addEventListener('DOMContentLoaded', () => {
    // Student login form
    const studentEmail = document.getElementById('studentEmail');
    const studentPassword = document.getElementById('studentPassword');
    
    if (studentPassword) {
        studentPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') studentLogin();
        });
    }

    // Teacher login form
    const teacherPassword = document.getElementById('teacherPassword');
    
    if (teacherPassword) {
        teacherPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') teacherLogin();
        });
    }
});

