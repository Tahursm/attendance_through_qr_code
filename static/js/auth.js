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
        saveAuthData(response.token, 'student', response.student);
        showAlert('studentLoginAlert', 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/student/dashboard';
        }, 1000);
    } catch (error) {
        showAlert('studentLoginAlert', error.message || 'Login failed', 'danger');
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
        showAlert('studentLoginAlert', error.message || 'Registration failed', 'danger');
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
        saveAuthData(response.token, 'teacher', response.teacher);
        showAlert('teacherLoginAlert', 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/teacher/dashboard';
        }, 1000);
    } catch (error) {
        showAlert('teacherLoginAlert', error.message || 'Login failed', 'danger');
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

