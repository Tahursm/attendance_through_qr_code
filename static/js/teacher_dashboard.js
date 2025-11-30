// QR Code Refresh System - Version 2.0 (6 seconds)
let currentSessionId = null;
let qrRefreshInterval = null;
let statsRefreshInterval = null;
let countdownInterval = null;

// Subject list for each semester (4-5 subjects per semester)
const subjectsBySemester = {
    '1': [
        'Engineering Mathematics I',
        'Engineering Physics',
        'Engineering Chemistry',
        'Basic Electrical Engineering',
        'Programming in C'
    ],
    '2': [
        'Engineering Mathematics II',
        'Engineering Graphics',
        'Data Structures',
        'Digital Electronics',
        'Object Oriented Programming'
    ],
    '3': [
        'Engineering Mathematics III',
        'Database Management Systems',
        'Computer Organization',
        'Operating Systems',
        'Discrete Mathematics'
    ],
    '4': [
        'Engineering Mathematics IV',
        'Computer Networks',
        'Software Engineering',
        'Design and Analysis of Algorithms',
        'Microprocessors'
    ],
    '5': [
        'Theory of Computation',
        'Web Technologies',
        'Machine Learning',
        'Computer Graphics',
        'Artificial Intelligence'
    ],
    '6': [
        'Compiler Design',
        'Mobile Application Development',
        'Cloud Computing',
        'Information Security',
        'Data Mining'
    ],
    '7': [
        'Big Data Analytics',
        'Internet of Things',
        'Blockchain Technology',
        'Deep Learning',
        'DevOps'
    ],
    '8': [
        'Project Work',
        'Cyber Security',
        'Natural Language Processing',
        'Advanced Database Systems',
        'Entrepreneurship'
    ]
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Verify authentication and user type
    if (!isAuthenticated()) {
        console.error('No authentication token found');
        alert('You are not logged in. Please login as a teacher.');
        window.location.href = '/';
        return;
    }
    
    const userType = getUserType();
    if (userType !== 'teacher') {
        console.error('Invalid user type for teacher dashboard:', userType);
        alert('You must be logged in as a teacher to access this page.');
        clearAuthData();
        window.location.href = '/';
        return;
    }
    
    // Verify the token by trying to get teacher profile first
    try {
        await TeacherAPI.getProfile();
    } catch (error) {
        console.error('Token validation failed:', error);
        if (error.message && (error.message.includes('Unauthorized') || error.message.includes('teacher access'))) {
            alert('Your session is invalid or you are not logged in as a teacher. Please login again.');
            clearAuthData();
            window.location.href = '/';
            return;
        }
    }

    await loadDashboard();
    await loadWiFiNetworks();
});

// Load all dashboard data
async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');
        const stats = await TeacherAPI.getDashboardStats();
        
        console.log('Dashboard stats received:', {
            hasProfile: !!stats.profile,
            hasStatistics: !!stats.statistics,
            hasSubjectStats: !!stats.subject_stats,
            hasRecentSessions: !!stats.recent_sessions
        });
        
        // Update profile information
        if (stats.profile) {
            updateProfile(stats.profile);
        } else {
            console.error('Profile data is missing from dashboard stats');
            // Try to fetch profile separately as fallback
            try {
                const profileResponse = await TeacherAPI.getProfile();
                if (profileResponse.teacher) {
                    updateProfile(profileResponse.teacher);
                }
            } catch (profileError) {
                console.error('Failed to fetch profile separately:', profileError);
            }
        }
        
        // Update statistics
        if (stats.statistics) {
            updateStatistics(stats.statistics);
        }
        
        // Update subject statistics
        if (stats.subject_stats) {
            updateSubjectStats(stats.subject_stats);
        }
        
        // Update recent sessions
        if (stats.recent_sessions) {
            updateRecentSessions(stats.recent_sessions);
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Try to load profile separately as fallback
        try {
            const profileResponse = await TeacherAPI.getProfile();
            if (profileResponse.teacher) {
                updateProfile(profileResponse.teacher);
            }
        } catch (profileError) {
            console.error('Failed to fetch profile as fallback:', profileError);
        }
    }
}

// Update profile information
function updateProfile(profile) {
    if (!profile) {
        console.error('updateProfile: Profile data is null or undefined');
        return;
    }
    
    console.log('Updating profile with data:', {
        teacher_id: profile.teacher_id,
        full_name: profile.full_name,
        email: profile.email
    });
    
    try {
        // Update navbar and welcome name
        if (profile.full_name) {
            const teacherNameEl = document.getElementById('teacherName');
            const welcomeNameEl = document.getElementById('welcomeName');
            if (teacherNameEl) teacherNameEl.textContent = profile.full_name;
            if (welcomeNameEl) welcomeNameEl.textContent = profile.full_name;
        }
        
        // Update profile section fields
        const profileFields = {
            'profileTeacherId': profile.teacher_id || 'N/A',
            'profileEmail': profile.email || 'N/A',
            'profileQualification': profile.qualification || 'N/A',
            'profileSpecialization': profile.specialization || 'N/A',
            'profileExperience': profile.experience_years ? `${profile.experience_years} years` : 'N/A',
            'profilePhone': profile.phone || 'N/A',
            'teacherBranch': profile.branch || 'N/A',
            'teacherDesignation': profile.designation || 'Teacher'
        };
        
        // Update each field
        for (const [fieldId, value] of Object.entries(profileFields)) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Profile field element not found: ${fieldId}`);
            }
        }
        
        console.log('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// Update statistics
function updateStatistics(stats) {
    document.getElementById('totalSessions').textContent = stats.total_sessions;
    document.getElementById('activeSessions').textContent = stats.active_sessions;
}

// Update subject statistics
function updateSubjectStats(subjectStats) {
    const container = document.getElementById('subjectStatsContainer');
    
    if (!subjectStats || subjectStats.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No subject statistics available</p>';
        return;
    }
    
    let html = '<div class="info-grid">';
    
    subjectStats.forEach(subject => {
        let badgeClass = 'badge-success';
        if (subject.attendance_rate < 75) badgeClass = 'badge-danger';
        else if (subject.attendance_rate < 85) badgeClass = 'badge-warning';
        
        html += `
            <div class="info-item">
                <label>${subject.subject}</label>
                <div class="value">
                    <span class="badge ${badgeClass}">${subject.attendance_rate}%</span>
                    <br>
                    <small style="color: #6b7280;">${subject.total_sessions} sessions</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Update recent sessions
function updateRecentSessions(sessions) {
    const tbody = document.getElementById('recentSessionsBody');
    
    if (!sessions || sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No sessions found</td></tr>';
        return;
    }
    
    let html = '';
    sessions.forEach(session => {
        const date = new Date(session.session_date).toLocaleDateString();
        const statusClass = session.is_active ? 'badge-success' : 'badge-primary';
        const statusText = session.is_active ? 'Active' : 'Completed';
        const attendancePercent = session.total_students > 0 
            ? ((session.present_count / session.total_students) * 100).toFixed(1) 
            : 0;
        
        html += `
            <tr id="session-row-${session.id}">
                <td>${session.session_id}</td>
                <td>${session.subject}</td>
                <td>${session.branch}</td>
                <td>${session.division || 'N/A'}</td>
                <td>${date}</td>
                <td>${session.present_count}/${session.total_students} (${attendancePercent}%)</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${session.is_active 
                        ? `<button class="btn btn-danger" onclick="endSessionById(${session.id})" id="end-btn-${session.id}" style="padding: 0.5rem 1rem; white-space: nowrap;">End Session</button>`
                        : `<button class="btn btn-secondary" disabled style="padding: 0.5rem 1rem; opacity: 0.6; cursor: not-allowed; white-space: nowrap;">Session Ended</button>`
                    }
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        ${session.is_active 
                            ? `<button class="btn btn-primary" onclick="showQRForSession(${session.id})" style="padding: 0.5rem 1rem; white-space: nowrap;">📱 Show QR</button>`
                            : ''
                        }
                        <button class="btn btn-primary" onclick="viewSessionDetails(${session.id})" style="padding: 0.5rem 1rem; white-space: nowrap;">📊 Analyze</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Refresh recent sessions only
async function refreshRecentSessions() {
    const refreshBtn = document.getElementById('refreshSessionsBtn');
    const refreshIcon = document.getElementById('refreshIcon');
    const tbody = document.getElementById('recentSessionsBody');
    
    if (!tbody) {
        console.error('Recent sessions table body not found');
        return;
    }
    
    try {
        // Show loading state
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshIcon.textContent = '⏳';
        }
        
        // Show loading in table
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;"><div class="spinner"></div></td></tr>';
        
        console.log('Fetching fresh dashboard stats...');
        // Fetch fresh dashboard stats to get updated sessions
        const stats = await TeacherAPI.getDashboardStats();
        
        console.log('Dashboard stats received:', {
            hasRecentSessions: !!stats.recent_sessions,
            sessionCount: stats.recent_sessions ? stats.recent_sessions.length : 0,
            sessions: stats.recent_sessions
        });
        
        if (!stats || !stats.recent_sessions) {
            throw new Error('No sessions data received from server');
        }
        
        // Update only the recent sessions table
        updateRecentSessions(stats.recent_sessions);
        
        console.log('Recent sessions refreshed successfully. Sessions displayed:', stats.recent_sessions.length);
        
    } catch (error) {
        console.error('Error refreshing recent sessions:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Failed to refresh sessions: ' + (error.message || 'Unknown error') + '</td></tr>';
        }
    } finally {
        // Restore button state
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshIcon.textContent = '🔄';
        }
    }
}

// Clear recent sessions list
function clearRecentSessions() {
    const tbody = document.getElementById('recentSessionsBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #6b7280;">No sessions displayed</td></tr>';
        console.log('Recent sessions cleared');
    }
}

// Update semester and subject dropdowns when branch is selected
function updateSemesterAndSubject() {
    const branch = document.getElementById('sessionBranch').value;
    const semesterSelect = document.getElementById('sessionSemester');
    const subjectSelect = document.getElementById('sessionSubject');
    
    if (branch) {
        // Enable semester dropdown
        semesterSelect.disabled = false;
        semesterSelect.value = '';
        
        // Reset and disable subject dropdown
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        subjectSelect.disabled = true;
    } else {
        // Disable both if no branch selected
        semesterSelect.disabled = true;
        semesterSelect.value = '';
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        subjectSelect.disabled = true;
    }
}

// Update subjects based on selected semester
function updateSubjects() {
    const semester = document.getElementById('sessionSemester').value;
    const subjectSelect = document.getElementById('sessionSubject');
    
    // Clear existing options
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    
    if (semester && subjectsBySemester[semester]) {
        // Add subjects for selected semester
        subjectsBySemester[semester].forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
        
        // Enable subject dropdown
        subjectSelect.disabled = false;
    } else {
        // Disable if no semester selected
        subjectSelect.disabled = true;
    }
}

// Create new session
async function createSession() {
    // Verify authentication first
    if (!isAuthenticated()) {
        showAlert('createSessionAlert', 'You are not logged in. Please login again.', 'danger');
        setTimeout(() => {
            clearAuthData();
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    // CRITICAL: Validate token's actual user_type (not just localStorage)
    const tokenUserType = getTokenUserType();
    const localStorageUserType = getUserType();
    
    console.log('createSession: Token validation', {
        tokenUserType: tokenUserType,
        localStorageUserType: localStorageUserType,
        expected: 'teacher'
    });
    
    if (tokenUserType !== 'teacher') {
        console.error('createSession: Token is for wrong user type!', {
            tokenUserType: tokenUserType,
            localStorageUserType: localStorageUserType,
            expected: 'teacher',
            token: getAuthToken() ? getAuthToken().substring(0, 30) + '...' : 'NO TOKEN'
        });
        showAlert('createSessionAlert', 'Authentication error: Your token is for a student account. Please login as a teacher.', 'danger');
        clearAuthData();
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    if (localStorageUserType !== 'teacher') {
        console.warn('createSession: localStorage userType mismatch, but token is correct. Syncing...');
        localStorage.setItem('userType', 'teacher');
    }
    
    // Verify token is actually for a teacher by checking profile
    try {
        await TeacherAPI.getProfile();
    } catch (error) {
        console.error('createSession: Token validation failed:', error);
        if (error.message && (error.message.includes('Unauthorized') || error.message.includes('teacher access'))) {
            showAlert('createSessionAlert', 'Authentication error: Please login again as a teacher', 'danger');
            clearAuthData();
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }
    }
    
    const data = {
        subject: document.getElementById('sessionSubject').value,
        branch: document.getElementById('sessionBranch').value,
        semester: parseInt(document.getElementById('sessionSemester').value),
        division: document.getElementById('sessionDivision').value,
        total_students: parseInt(document.getElementById('sessionTotalStudents').value)
    };
    
    // Validate all fields
    if (!data.branch || !data.semester || !data.subject || !data.division || !data.total_students) {
        let missingFields = [];
        if (!data.branch) missingFields.push('Branch');
        if (!data.semester) missingFields.push('Semester');
        if (!data.subject) missingFields.push('Subject');
        if (!data.division) missingFields.push('Division');
        if (!data.total_students) missingFields.push('Total Students');
        showAlert('createSessionAlert', `Please fill all required fields: ${missingFields.join(', ')}`, 'danger');
        return;
    }
    
    // Additional validation: ensure division is not empty string
    if (data.division.trim() === '') {
        showAlert('createSessionAlert', 'Please select a Division', 'danger');
        return;
    }
    
    try {
        console.log('Creating session with data:', data);
        console.log('Auth token exists:', !!getAuthToken());
        console.log('User type:', getUserType());
        
        const response = await AttendanceAPI.createSession(data);
        currentSessionId = response.session.id;
        
        showAlert('createSessionAlert', 'Session created successfully!', 'success');
        
        // CRITICAL: Verify token is still valid for teacher before starting QR generation
        const postCreateUserType = getUserType();
        const postCreateToken = getAuthToken();
        console.log('After session creation - token verification:', {
            hasToken: !!postCreateToken,
            userType: postCreateUserType,
            tokenPreview: postCreateToken ? postCreateToken.substring(0, 20) + '...' : 'NO TOKEN'
        });
        
        if (postCreateUserType !== 'teacher' || !postCreateToken) {
            console.error('CRITICAL: Token became invalid after session creation!', {
                userType: postCreateUserType,
                hasToken: !!postCreateToken
            });
            showAlert('createSessionAlert', 'Authentication error: Please login again as a teacher', 'danger');
            clearAuthData();
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }
        
        // Clear form and reset dropdowns
        document.getElementById('createSessionForm').reset();
        document.getElementById('sessionSemester').disabled = true;
        document.getElementById('sessionSubject').disabled = true;
        document.getElementById('sessionSubject').innerHTML = '<option value="">Select Subject</option>';
        
        // Show QR section and start generating QR codes
        showQRSection(response.session);
        startQRGeneration(currentSessionId);
        
        // Reload dashboard
        setTimeout(() => {
            loadDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Session creation error:', error);
        const errorMsg = error.message || 'Failed to create session';
        showAlert('createSessionAlert', errorMsg, 'danger');
        
        // If authentication error, redirect to login
        if (errorMsg.includes('Unauthorized') || errorMsg.includes('Authentication') || errorMsg.includes('Token')) {
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
    }
}

// Show QR section for a session
function showQRForSession(sessionId) {
    currentSessionId = sessionId;
    
    // Get session details
    TeacherAPI.getSessions().then(response => {
        const session = response.sessions.find(s => s.id === sessionId);
        if (session) {
            showQRSection(session);
            startQRGeneration(sessionId);
        }
    });
}

// Show QR section
function showQRSection(session) {
    document.getElementById('qrSection').style.display = 'block';
    const divisionText = session.division ? ` - ${session.division}` : '';
    document.getElementById('qrSessionTitle').textContent = `${session.subject}${divisionText} - Session Active`;
    document.getElementById('qrSubject').textContent = `${session.subject}${divisionText}`;
    document.getElementById('qrDivision').textContent = session.division || 'N/A';
    document.getElementById('qrTotalStudents').textContent = session.total_students;
    
    // Scroll to QR section
    document.getElementById('qrSection').scrollIntoView({ behavior: 'smooth' });
}

// Start QR code generation (refresh every 6 seconds)
function startQRGeneration(sessionId) {
    console.log('Starting QR generation for session:', sessionId);
    
    // Verify authentication before starting
    if (!isAuthenticated() || getUserType() !== 'teacher') {
        console.error('startQRGeneration: Invalid authentication state');
        showAlert('qrAlert', 'Authentication error: Please login again as a teacher', 'danger');
        return;
    }
    
    // Clear existing intervals
    if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
        qrRefreshInterval = null;
    }
    if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
        statsRefreshInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Generate first QR immediately
    generateQRCode(sessionId);
    
    // Refresh QR every 6 seconds
    qrRefreshInterval = setInterval(() => {
        // Check auth before each interval execution
        if (!isAuthenticated()) {
            console.warn('QR refresh interval: No auth, stopping');
            stopQRGeneration();
            return;
        }
        console.log('QR refresh interval triggered - generating new QR code');
        generateQRCode(sessionId);
    }, 6000);
    
    console.log('QR refresh interval set to 6 seconds (6000ms)');
    
    // Update stats every 3 seconds
    statsRefreshInterval = setInterval(() => {
        // Check auth before each interval execution
        if (!isAuthenticated()) {
            console.warn('Stats refresh interval: No auth, stopping');
            stopQRGeneration();
            return;
        }
        updateSessionStats(sessionId);
    }, 3000);
}

// Generate QR code
async function generateQRCode(sessionId) {
    try {
        // Verify authentication before making API call
        if (!isAuthenticated()) {
            console.error('generateQRCode: Not authenticated, cannot generate QR code');
            showAlert('qrAlert', 'Authentication required. Please login again.', 'danger');
            stopQRGeneration();
            return;
        }
        
        // CRITICAL: Verify token's actual user_type (decode from JWT)
        const tokenUserType = getTokenUserType();
        const localStorageUserType = getUserType();
        const token = getAuthToken();
        
        console.log('generateQRCode: Pre-flight token validation', {
            hasToken: !!token,
            tokenUserType: tokenUserType,
            localStorageUserType: localStorageUserType,
            sessionId: sessionId,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
        });
        
        if (tokenUserType !== 'teacher') {
            console.error('generateQRCode: Token is for wrong user type!', {
                expected: 'teacher',
                tokenUserType: tokenUserType,
                localStorageUserType: localStorageUserType,
                token: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
            });
            showAlert('qrAlert', 'Authentication error: Your token is for a student account. Please login again as a teacher.', 'danger');
            stopQRGeneration();
            clearAuthData();
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }
        
        if (localStorageUserType !== 'teacher') {
            console.warn('generateQRCode: localStorage userType mismatch, syncing...');
            localStorage.setItem('userType', 'teacher');
        }
        
        console.log('Generating QR code for session:', sessionId);
        const response = await AttendanceAPI.generateQR(sessionId);
        console.log('QR code generated successfully', {
            has_qr_code: !!response.qr_code,
            has_qr_data: !!response.qr_data,
            expires_in: response.security_features?.expires_in_seconds
        });
        
        // Store QR data for easy access
        window.currentQRData = response.qr_data;
        
        // Escape HTML special characters in QR data
        const escapedQRData = String(response.qr_data || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        
        // Get container element
        const container = document.getElementById('qrCodeContainer');
        if (!container) {
            console.error('QR code container not found!');
            return;
        }
        
        // Display QR code with data
        container.innerHTML = `
            <img src="${response.qr_code}" alt="QR Code" style="max-width: 300px; margin-bottom: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: white;">
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-top: 1rem; border: 2px solid #3b82f6;">
                <p style="margin: 0 0 0.5rem 0; font-weight: bold; color: #1e40af; font-size: 1rem;">📋 QR Code Data (for manual entry):</p>
                <div style="position: relative;">
                    <textarea id="qrDataText" readonly style="width: 100%; min-height: 100px; padding: 0.75rem 3rem 0.75rem 0.75rem; border: 2px solid #3b82f6; border-radius: 4px; font-family: monospace; font-size: 0.875rem; background: white; resize: vertical; box-sizing: border-box;">${escapedQRData}</textarea>
                    <button onclick="copyQRData()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem; font-weight: bold; z-index: 10;">📋 Copy</button>
                </div>
                <p id="copyFeedback" style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #10b981; font-weight: bold; display: none;">✓ Copied to clipboard!</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Click textarea or Copy button to copy - Share with students for manual entry</p>
            </div>
        `;
        
        // Set the actual value using textContent to avoid HTML issues
        const textarea = document.getElementById('qrDataText');
        if (textarea) {
            textarea.value = response.qr_data;
            // Add click handler
            textarea.addEventListener('click', function() {
                this.select();
                try {
                    document.execCommand('copy');
                    showCopyFeedback();
                } catch (e) {
                    console.log('Copy command failed, trying clipboard API');
                }
            });
        }
        
        // Show countdown timer
        startCountdown(6);
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        
        // Check if it's an authentication/user type error
        if (error.message && (
            error.message.includes('Unauthorized') || 
            error.message.includes('teacher access') ||
            error.message.includes('student')
        )) {
            showAlert('qrAlert', 'Authentication error: Please login again as a teacher', 'danger');
            stopQRGeneration();
            setTimeout(() => {
                clearAuthData();
                window.location.href = '/';
            }, 2000);
            return;
        }
        
        showAlert('qrAlert', 'Failed to generate QR code: ' + error.message, 'danger');
        stopQRGeneration();
    }
}

// Start countdown timer
function startCountdown(seconds) {
    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    let remaining = seconds;
    const timerElement = document.getElementById('qrTimer');
    
    if (!timerElement) return;
    
    timerElement.textContent = `Refreshing in ${remaining}s`;
    timerElement.classList.remove('qr-expired');
    
    countdownInterval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            timerElement.textContent = `Refreshing in ${remaining}s`;
            if (remaining <= 2) {
                timerElement.classList.add('qr-expired');
            }
        } else {
            timerElement.textContent = 'Generating new code...';
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }, 1000);
}

// Copy QR data to clipboard
function copyQRData() {
    const qrDataText = document.getElementById('qrDataText');
    if (!qrDataText) {
        console.error('QR data textarea not found');
        return;
    }
    
    // Use the actual value
    const qrData = qrDataText.value || window.currentQRData || '';
    
    if (!qrData) {
        alert('No QR code data available to copy');
        return;
    }
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(qrData).then(() => {
            console.log('QR data copied to clipboard');
            showCopyFeedback();
        }).catch(err => {
            console.error('Clipboard API failed, trying fallback:', err);
            // Fallback to execCommand
            qrDataText.select();
            qrDataText.setSelectionRange(0, 99999);
            try {
                document.execCommand('copy');
                showCopyFeedback();
            } catch (e) {
                alert('Failed to copy. Please select and copy manually.');
            }
        });
    } else {
        // Fallback for older browsers
        qrDataText.select();
        qrDataText.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (e) {
            alert('Failed to copy. Please select and copy manually.');
        }
    }
}

// Show copy feedback
function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    if (feedback) {
        feedback.style.display = 'block';
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
    }
}

// Update session statistics
async function updateSessionStats(sessionId) {
    try {
        // Verify authentication before making API call
        if (!isAuthenticated()) {
            console.warn('updateSessionStats: Not authenticated, stopping intervals');
            stopQRGeneration();
            showAlert('qrAlert', 'Session paused: Please login again to continue', 'warning');
            return;
        }
        
        const response = await AttendanceAPI.getSessionStats(sessionId);
        
        document.getElementById('qrPresentCount').textContent = response.present_count;
        document.getElementById('qrTotalStudents').textContent = response.total_students;
        
        const percentage = (response.present_count / response.total_students * 100) || 0;
        document.getElementById('attendanceProgress').style.width = `${percentage}%`;
        
        // If session is no longer active, stop QR generation
        if (!response.is_active) {
            stopQRGeneration();
            showAlert('qrAlert', 'Session has been ended', 'warning');
        }
        
    } catch (error) {
        console.error('Error updating session stats:', error);
        
        // Check if it's an authentication/user type error
        if (error.message && (
            error.message.includes('Unauthorized') || 
            error.message.includes('teacher access') ||
            error.message.includes('student')
        )) {
            console.error('Authentication error in stats update - stopping intervals');
            stopQRGeneration();
            // Don't show alert repeatedly, just log and stop
            return;
        }
        
        // For other errors, just log them (don't spam alerts every 3 seconds)
        // showAlert('qrAlert', 'Error updating stats: ' + error.message, 'danger');
    }
}

// Stop QR generation
function stopQRGeneration() {
    // Clear all intervals
    if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
        qrRefreshInterval = null;
    }
    if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
        statsRefreshInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// End session by ID (for use in table rows)
async function endSessionById(sessionId) {
    if (!sessionId) {
        alert('Invalid session ID');
        return;
    }
    
    if (!confirm('Are you sure you want to end this session?')) {
        return;
    }
    
    // Get the button element to show loading state
    const endButton = document.getElementById(`end-btn-${sessionId}`);
    const row = document.getElementById(`session-row-${sessionId}`);
    
    // Disable button and show loading state
    if (endButton) {
        endButton.disabled = true;
        endButton.textContent = 'Ending...';
        endButton.style.opacity = '0.6';
        endButton.style.cursor = 'not-allowed';
    }
    
    try {
        console.log('Ending session:', sessionId);
        const response = await AttendanceAPI.endSession(sessionId);
        console.log('Session ended successfully:', response);
        
        // If this is the currently active session, stop QR generation
        if (currentSessionId === sessionId) {
            stopQRGeneration();
            document.getElementById('qrSection').style.display = 'none';
            currentSessionId = null;
        }
        
        // Show success message
        alert('Session ended successfully!');
        
        // Immediately update the button in the row
        if (endButton && row) {
            // Update button to "Session Ended"
            endButton.textContent = 'Session Ended';
            endButton.className = 'btn btn-secondary';
            endButton.style.opacity = '0.6';
            endButton.style.cursor = 'not-allowed';
            endButton.onclick = null; // Remove click handler
            
            // Update status badge
            const statusCell = row.querySelector('td:nth-child(6)');
            if (statusCell) {
                statusCell.innerHTML = '<span class="badge badge-primary">Completed</span>';
            }
        }
        
        // Refresh the recent sessions table to ensure everything is updated
        console.log('Refreshing recent sessions...');
        await refreshRecentSessions();
        console.log('Recent sessions refreshed');
        
        // Also update statistics cards
        try {
            const stats = await TeacherAPI.getDashboardStats();
            updateStatistics(stats.statistics);
            console.log('Statistics updated');
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
        
    } catch (error) {
        console.error('Error ending session:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Re-enable button on error
        if (endButton) {
            endButton.disabled = false;
            endButton.textContent = 'End Session';
            endButton.style.opacity = '1';
            endButton.style.cursor = 'pointer';
        }
        
        alert('Failed to end session: ' + (error.message || 'Unknown error. Please try again.'));
    }
}

// End session (for current active session in QR section)
async function endSession() {
    if (!currentSessionId) return;
    
    if (!confirm('Are you sure you want to end this session?')) {
        return;
    }
    
    try {
        await AttendanceAPI.endSession(currentSessionId);
        
        stopQRGeneration();
        document.getElementById('qrSection').style.display = 'none';
        showAlert('createSessionAlert', 'Session ended successfully', 'success');
        
        currentSessionId = null;
        loadDashboard();
        
    } catch (error) {
        showAlert('qrAlert', error.message || 'Failed to end session', 'danger');
    }
}

// View session details - Show comprehensive analysis modal
async function viewSessionDetails(sessionId) {
    const modal = document.getElementById('sessionAnalysisModal');
    const content = document.getElementById('sessionAnalysisContent');
    
    // Show modal with loading state
    modal.style.display = 'block';
    // Prevent body scroll on mobile
    document.body.classList.add('modal-open');
    content.innerHTML = '<div class="spinner"></div>';
    
    // Enable touch scrolling on modal
    enableModalScrolling(modal);
    
    // Setup touch event handlers after content is loaded
    setTimeout(() => {
        setupModalTouchHandlers();
    }, 100);
    
    try {
        // Use the new attendance report API that shows both presentees and absentees
        const reportResponse = await AttendanceAPI.getReport({ session_id: sessionId });
        const report = reportResponse.report || [];
        const summary = reportResponse.summary || {};
        const sessionInfo = reportResponse.session_info || {};
        
        // Get session details from the report or fetch separately
        const sessionsResponse = await TeacherAPI.getSessions();
        const session = sessionsResponse.sessions.find(s => s.id === sessionId) || sessionInfo;
        
        const totalPresent = summary.present || 0;
        const absentCount = summary.absent || 0;
        const totalStudents = summary.total_students || session.total_students || 0;
        const attendancePercent = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;
        
        // Format date
        const sessionDate = session.session_date ? new Date(session.session_date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : (sessionInfo.session_date ? new Date(sessionInfo.session_date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A');
        
        // Get present and absent students from report
        const presentStudents = report.filter(r => r.status === 'Present');
        const absentStudents = report.filter(r => r.status === 'Absent');
        
        // Get marked times for present students
        const markedAtTimes = presentStudents
            .filter(a => a.marked_at)
            .map(a => new Date(a.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
            .sort();
        
        // Check if mobile device
        const isMobile = window.innerWidth <= 768;
        const sectionPadding = isMobile ? '1rem' : '1.5rem';
        const sectionGap = isMobile ? '1rem' : '1.5rem';
        const cardPadding = isMobile ? '1rem' : '1.5rem';
        const statFontSize = isMobile ? '1.5rem' : '2rem';
        const tableMaxHeight = isMobile ? '300px' : '500px';
        
        let html = `
            <div style="display: grid; gap: ${sectionGap};">
                <!-- Session Overview -->
                <div style="background: #f3f4f6; padding: ${cardPadding}; border-radius: 8px;">
                    <h3 style="margin-top: 0; margin-bottom: ${isMobile ? '0.75rem' : '1rem'}; font-size: ${isMobile ? '0.9375rem' : '1rem'}; line-height: 1.3;">Session Information</h3>
                    <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'}; gap: ${isMobile ? '0.75rem' : '1rem'};">
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Session ID:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${session.session_id}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Subject:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${session.subject}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Branch:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${session.branch}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Semester:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${session.semester || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Division:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${session.division || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Date:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${sessionDate}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Status:</strong><br>
                            <span class="badge ${session.is_active ? 'badge-success' : 'badge-primary'}">${session.is_active ? 'Active' : 'Completed'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Statistics Cards -->
                <div style="display: grid; grid-template-columns: ${isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))'}; gap: ${isMobile ? '0.75rem' : '1rem'};">
                    <div style="background: #dbeafe; padding: ${cardPadding}; border-radius: 8px; text-align: center; min-height: ${isMobile ? '100px' : '120px'}; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: ${statFontSize}; font-weight: bold; color: #1e40af; line-height: 1.2; margin-bottom: 0.5rem;">${totalPresent}</div>
                        <div style="color: #1e40af; font-weight: 500; font-size: ${isMobile ? '0.875rem' : '0.9375rem'}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Present Students</div>
                    </div>
                    <div style="background: #fee2e2; padding: ${cardPadding}; border-radius: 8px; text-align: center; min-height: ${isMobile ? '100px' : '120px'}; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: ${statFontSize}; font-weight: bold; color: #991b1b; line-height: 1.2; margin-bottom: 0.5rem;">${absentCount}</div>
                        <div style="color: #991b1b; font-weight: 500; font-size: ${isMobile ? '0.875rem' : '0.9375rem'}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Absent Students</div>
                    </div>
                    <div style="background: #f3f4f6; padding: ${cardPadding}; border-radius: 8px; text-align: center; min-height: ${isMobile ? '100px' : '120px'}; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: ${statFontSize}; font-weight: bold; color: #374151; line-height: 1.2; margin-bottom: 0.5rem;">${totalStudents}</div>
                        <div style="color: #374151; font-weight: 500; font-size: ${isMobile ? '0.875rem' : '0.9375rem'}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Total Students</div>
                    </div>
                    <div style="background: ${attendancePercent >= 75 ? '#d1fae5' : attendancePercent >= 50 ? '#fef3c7' : '#fee2e2'}; padding: ${cardPadding}; border-radius: 8px; text-align: center; min-height: ${isMobile ? '100px' : '120px'}; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: ${statFontSize}; font-weight: bold; color: ${attendancePercent >= 75 ? '#065f46' : attendancePercent >= 50 ? '#92400e' : '#991b1b'}; line-height: 1.2; margin-bottom: 0.5rem;">${attendancePercent}%</div>
                        <div style="color: ${attendancePercent >= 75 ? '#065f46' : attendancePercent >= 50 ? '#92400e' : '#991b1b'}; font-weight: 500; font-size: ${isMobile ? '0.875rem' : '0.9375rem'}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">Attendance Rate</div>
                    </div>
                </div>
                
                <!-- Attendance Progress Bar -->
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                        <span style="font-weight: 500; font-size: ${isMobile ? '0.875rem' : '1rem'};">Attendance Progress</span>
                        <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${totalPresent}/${totalStudents} (${attendancePercent}%)</span>
                    </div>
                    <div style="background: #e5e7eb; height: ${isMobile ? '24px' : '30px'}; border-radius: ${isMobile ? '12px' : '15px'}; overflow: hidden; position: relative;">
                        <div style="background: ${attendancePercent >= 75 ? '#10b981' : attendancePercent >= 50 ? '#f59e0b' : '#ef4444'}; height: 100%; width: ${attendancePercent}%; transition: width 0.3s;"></div>
                    </div>
                </div>
                
                <!-- Complete Attendance List (Presentees and Absentees) -->
                <div>
                    <h3 style="margin-bottom: ${isMobile ? '0.75rem' : '1rem'}; font-size: ${isMobile ? '0.9375rem' : '1rem'}; line-height: 1.3;">📝 Complete Attendance Report - ${sessionInfo.division || session.division || 'All Divisions'}</h3>
                    <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'}; gap: ${isMobile ? '0.5rem' : '1rem'}; margin-bottom: 1rem;">
                        <div style="background: #dbeafe; padding: ${isMobile ? '0.75rem' : '1rem'}; border-radius: 8px;">
                            <strong style="color: #1e40af; font-size: ${isMobile ? '0.875rem' : '1rem'};">✅ Present: ${presentStudents.length}</strong>
                        </div>
                        <div style="background: #fee2e2; padding: ${isMobile ? '0.75rem' : '1rem'}; border-radius: 8px;">
                            <strong style="color: #991b1b; font-size: ${isMobile ? '0.875rem' : '1rem'};">❌ Absent: ${absentStudents.length}</strong>
                        </div>
                    </div>
                    ${report.length > 0 ? `
                        <div style="max-height: ${tableMaxHeight}; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; -webkit-overflow-scrolling: touch;">
                            <div class="table-responsive">
                                <table class="table" style="margin: 0; font-size: ${isMobile ? '0.75rem' : '0.875rem'};">
                                    <thead style="position: sticky; top: 0; background: white; z-index: 10;">
                                        <tr>
                                            <th>#</th>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Status</th>
                                            <th>Marked At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${report.map((record, index) => {
                                            const markedTime = record.marked_at ? new Date(record.marked_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A';
                                            const statusClass = record.status === 'Present' ? 'badge-success' : 'badge-danger';
                                            const rowStyle = record.status === 'Absent' ? 'background-color: #fef2f2;' : '';
                                            return `
                                                <tr style="${rowStyle}">
                                                    <td>${index + 1}</td>
                                                    <td>${record.student_id}</td>
                                                    <td>${record.student_name}</td>
                                                    <td><span class="badge ${statusClass}">${record.status}</span></td>
                                                    <td style="color: #6b7280; font-size: 0.875rem;">${markedTime}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: ${isMobile ? '1.5rem' : '2rem'}; color: #6b7280; background: #f3f4f6; border-radius: 8px; font-size: ${isMobile ? '0.875rem' : '1rem'};">
                            No attendance data available.
                        </div>
                    `}
                </div>
                
                <!-- Quick Stats -->
                ${markedAtTimes.length > 0 ? `
                    <div style="background: #f3f4f6; padding: ${isMobile ? '0.75rem' : '1rem'}; border-radius: 8px; display: grid; grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))'}; gap: ${isMobile ? '0.75rem' : '1rem'};">
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">First Marked:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${markedAtTimes[0] || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Last Marked:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${markedAtTimes[markedAtTimes.length - 1] || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="font-size: ${isMobile ? '0.875rem' : '1rem'};">Total Marked:</strong><br>
                            <span style="color: #6b7280; font-size: ${isMobile ? '0.8125rem' : '0.875rem'};">${markedAtTimes.length} students</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        content.innerHTML = html;
        
        // Setup touch event handlers after content is rendered
        setTimeout(() => {
            setupModalTouchHandlers();
        }, 50);
        
    } catch (error) {
        console.error('Error loading session details:', error);
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">❌ Failed to load session details</p>
                <p style="color: #6b7280;">${error.message || 'Please try again later'}</p>
                <button class="btn btn-primary" onclick="closeSessionAnalysis()" style="margin-top: 1rem;">Close</button>
            </div>
        `;
    }
}

// Setup touch event handlers for modal
let modalTouchHandlersSetup = false;

function setupModalTouchHandlers() {
    // Prevent duplicate setup
    if (modalTouchHandlersSetup) return;
    
    const closeBtn = document.querySelector('.modal-close-btn');
    const modal = document.getElementById('sessionAnalysisModal');
    
    if (closeBtn && !closeBtn.dataset.touchHandled) {
        closeBtn.dataset.touchHandled = 'true';
        
        // Add touch feedback for close button
        closeBtn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
        }, { passive: true });
        
        closeBtn.addEventListener('touchend', function(e) {
            this.style.transform = '';
            this.style.opacity = '';
            // Trigger close
            e.preventDefault();
            e.stopPropagation();
            handleCloseModal(e);
        }, { passive: false });
    }
    
    // Make all buttons in modal touch-responsive
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        const modalButtons = modalContent.querySelectorAll('button, .btn');
        modalButtons.forEach(button => {
            // Skip if already has touch handlers or is the close button
            if (button.dataset.touchHandled || button.classList.contains('modal-close-btn')) return;
            button.dataset.touchHandled = 'true';
            
            // Add touch feedback
            button.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.9';
            }, { passive: true });
            
            button.addEventListener('touchend', function(e) {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });
        });
    }
    
    modalTouchHandlersSetup = true;
}

// Enable touch scrolling on modal
function enableModalScrolling(modal) {
    if (!modal) return;
    
    // Ensure modal overlay is scrollable
    modal.style.touchAction = 'pan-y pan-x';
    modal.style.webkitOverflowScrolling = 'touch';
    
    // Ensure modal content is scrollable
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.touchAction = 'pan-y pan-x';
        modalContent.style.webkitOverflowScrolling = 'touch';
        modalContent.style.overflowY = 'auto';
        modalContent.style.overflowX = 'hidden';
    }
    
    // Enable scrolling on all scrollable containers
    const scrollableContainers = modal.querySelectorAll('[style*="max-height"], .table-responsive');
    scrollableContainers.forEach(container => {
        container.style.touchAction = 'pan-y pan-x';
        container.style.webkitOverflowScrolling = 'touch';
        if (container.classList.contains('table-responsive')) {
            container.style.overflowX = 'auto';
        }
    });
}

// Reset touch handlers flag when modal closes
function resetModalTouchHandlers() {
    modalTouchHandlersSetup = false;
    // Remove touch handled flags
    const buttons = document.querySelectorAll('[data-touch-handled="true"]');
    buttons.forEach(btn => {
        btn.removeAttribute('data-touch-handled');
    });
}

// Handle modal close (used by both click and touch)
function handleCloseModal(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    closeSessionAnalysis();
}

// Close session analysis modal
function closeSessionAnalysis() {
    const modal = document.getElementById('sessionAnalysisModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Re-enable body scroll
    document.body.classList.remove('modal-open');
    // Reset touch handlers for next time
    resetModalTouchHandlers();
}

// Close modal when clicking/touching outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('sessionAnalysisModal');
    if (modal && event.target === modal) {
        handleCloseModal(event);
    }
});

// Also handle touch events for closing modal
document.addEventListener('touchend', function(event) {
    const modal = document.getElementById('sessionAnalysisModal');
    if (modal && event.target === modal && modal.style.display === 'block') {
        handleCloseModal(event);
    }
}, { passive: true });

// Close modal on ESC key press
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('sessionAnalysisModal');
        if (modal && modal.style.display === 'block') {
            closeSessionAnalysis();
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopQRGeneration();
});

// ========== WiFi Network Management Functions ==========

// Load WiFi networks
async function loadWiFiNetworks() {
    try {
        const response = await fetch('/api/teacher/wifi-networks', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to load WiFi networks');
        }
        
        const tbody = document.getElementById('wifiNetworksBody');
        
        if (!data.wifi_networks || data.wifi_networks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No WiFi networks configured</td></tr>';
            return;
        }
        
        let html = '';
        data.wifi_networks.forEach(network => {
            const statusBadge = network.is_active ? 
                '<span class="badge badge-success">Active</span>' : 
                '<span class="badge badge-danger">Inactive</span>';
            
            html += `
                <tr>
                    <td><strong>${network.ssid}</strong></td>
                    <td>${network.location}</td>
                    <td>${network.branch}</td>
                    <td>${network.room_number || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${network.is_active ? 
                            `<button class="btn btn-sm btn-danger" onclick="deactivateWiFiNetwork(${network.id})">Deactivate</button>` :
                            `<button class="btn btn-sm btn-success" onclick="activateWiFiNetwork(${network.id})">Activate</button>`
                        }
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading WiFi networks:', error);
        document.getElementById('wifiNetworksBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load WiFi networks</td></tr>';
    }
}

// Add WiFi network
async function addWiFiNetwork() {
    try {
        const ssid = document.getElementById('wifiSSID').value.trim();
        const bssid = document.getElementById('wifiBSSID').value.trim();
        const location = document.getElementById('wifiLocation').value.trim();
        const branch = document.getElementById('wifiBranch').value;
        const roomNumber = document.getElementById('wifiRoomNumber').value.trim();
        
        if (!ssid || !location || !branch) {
            showAlert('wifiAlert', 'Please fill in all required fields', 'danger');
            return;
        }
        
        showAlert('wifiAlert', 'Adding WiFi network...', 'info');
        
        const response = await fetch('/api/teacher/wifi-networks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ssid: ssid,
                bssid: bssid || null,
                location: location,
                branch: branch,
                room_number: roomNumber || null
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add WiFi network');
        }
        
        showAlert('wifiAlert', '✓ WiFi network added successfully!', 'success');
        
        // Clear form
        document.getElementById('addWiFiForm').reset();
        
        // Reload networks list
        await loadWiFiNetworks();
        
    } catch (error) {
        console.error('Error adding WiFi network:', error);
        showAlert('wifiAlert', error.message || 'Failed to add WiFi network', 'danger');
    }
}

// Deactivate WiFi network
async function deactivateWiFiNetwork(networkId) {
    if (!confirm('Are you sure you want to deactivate this WiFi network?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/teacher/wifi-networks/${networkId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to deactivate WiFi network');
        }
        
        showAlert('wifiAlert', '✓ WiFi network deactivated', 'success');
        await loadWiFiNetworks();
        
    } catch (error) {
        console.error('Error deactivating WiFi network:', error);
        showAlert('wifiAlert', error.message || 'Failed to deactivate WiFi network', 'danger');
    }
}

// Activate WiFi network
async function activateWiFiNetwork(networkId) {
    try {
        const response = await fetch(`/api/teacher/wifi-networks/${networkId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_active: true
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to activate WiFi network');
        }
        
        showAlert('wifiAlert', '✓ WiFi network activated', 'success');
        await loadWiFiNetworks();
        
    } catch (error) {
        console.error('Error activating WiFi network:', error);
        showAlert('wifiAlert', error.message || 'Failed to activate WiFi network', 'danger');
    }
}

