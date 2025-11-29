let currentSessionId = null;
let qrRefreshInterval = null;
let statsRefreshInterval = null;

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
    if (!isAuthenticated() || getUserType() !== 'teacher') {
        window.location.href = '/';
        return;
    }

    await loadDashboard();
    await loadWiFiNetworks();
});

// Load all dashboard data
async function loadDashboard() {
    try {
        const stats = await TeacherAPI.getDashboardStats();
        
        // Update profile information
        updateProfile(stats.profile);
        
        // Update statistics
        updateStatistics(stats.statistics);
        
        // Update subject statistics
        updateSubjectStats(stats.subject_stats);
        
        // Update recent sessions
        updateRecentSessions(stats.recent_sessions);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update profile information
function updateProfile(profile) {
    document.getElementById('teacherName').textContent = profile.full_name;
    document.getElementById('welcomeName').textContent = profile.full_name;
    
    document.getElementById('profileTeacherId').textContent = profile.teacher_id;
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileQualification').textContent = profile.qualification || 'N/A';
    document.getElementById('profileSpecialization').textContent = profile.specialization || 'N/A';
    document.getElementById('profileExperience').textContent = profile.experience_years ? `${profile.experience_years} years` : 'N/A';
    document.getElementById('profilePhone').textContent = profile.phone || 'N/A';
    
    document.getElementById('teacherBranch').textContent = profile.branch;
    document.getElementById('teacherDesignation').textContent = profile.designation || 'Teacher';
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No sessions found</td></tr>';
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
            <tr>
                <td>${session.session_id}</td>
                <td>${session.subject}</td>
                <td>${session.branch}</td>
                <td>${date}</td>
                <td>${session.present_count}/${session.total_students} (${attendancePercent}%)</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${session.is_active 
                        ? `<button class="btn btn-primary" onclick="showQRForSession(${session.id})" style="padding: 0.5rem 1rem;">Show QR</button>`
                        : `<button class="btn btn-primary" onclick="viewSessionDetails(${session.id})" style="padding: 0.5rem 1rem;">View Details</button>`
                    }
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
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
    const data = {
        subject: document.getElementById('sessionSubject').value,
        branch: document.getElementById('sessionBranch').value,
        semester: parseInt(document.getElementById('sessionSemester').value),
        total_students: parseInt(document.getElementById('sessionTotalStudents').value)
    };
    
    // Validate all fields
    if (!data.branch || !data.semester || !data.subject || !data.total_students) {
        showAlert('createSessionAlert', 'Please fill all fields in order: Branch → Semester → Subject → Total Students', 'danger');
        return;
    }
    
    try {
        const response = await AttendanceAPI.createSession(data);
        currentSessionId = response.session.id;
        
        showAlert('createSessionAlert', 'Session created successfully!', 'success');
        
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
        showAlert('createSessionAlert', error.message || 'Failed to create session', 'danger');
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
    document.getElementById('qrSessionTitle').textContent = `${session.subject} - Session Active`;
    document.getElementById('qrSubject').textContent = session.subject;
    document.getElementById('qrTotalStudents').textContent = session.total_students;
    
    // Scroll to QR section
    document.getElementById('qrSection').scrollIntoView({ behavior: 'smooth' });
}

// Start QR code generation (refresh every 6 seconds)
function startQRGeneration(sessionId) {
    // Clear existing intervals
    if (qrRefreshInterval) clearInterval(qrRefreshInterval);
    if (statsRefreshInterval) clearInterval(statsRefreshInterval);
    
    // Generate first QR immediately
    generateQRCode(sessionId);
    
    // Refresh QR every 6 seconds
    qrRefreshInterval = setInterval(() => {
        generateQRCode(sessionId);
    }, 6000);
    
    // Update stats every 3 seconds
    statsRefreshInterval = setInterval(() => {
        updateSessionStats(sessionId);
    }, 3000);
}

// Generate QR code
async function generateQRCode(sessionId) {
    try {
        const response = await AttendanceAPI.generateQR(sessionId);
        
        // Display QR code
        document.getElementById('qrCodeContainer').innerHTML = `
            <img src="${response.qr_code}" alt="QR Code" style="max-width: 300px;">
        `;
        
        // Show countdown timer
        startCountdown(6);
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showAlert('qrAlert', 'Failed to generate QR code', 'danger');
        stopQRGeneration();
    }
}

// Start countdown timer
function startCountdown(seconds) {
    let remaining = seconds;
    const timerElement = document.getElementById('qrTimer');
    
    timerElement.textContent = `Refreshing in ${remaining}s`;
    timerElement.classList.remove('qr-expired');
    
    const countdown = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            timerElement.textContent = `Refreshing in ${remaining}s`;
            if (remaining <= 2) {
                timerElement.classList.add('qr-expired');
            }
        } else {
            timerElement.textContent = 'Generating new code...';
            clearInterval(countdown);
        }
    }, 1000);
}

// Update session statistics
async function updateSessionStats(sessionId) {
    try {
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
    }
}

// Stop QR generation
function stopQRGeneration() {
    if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
        qrRefreshInterval = null;
    }
    if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
        statsRefreshInterval = null;
    }
}

// End session
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

// View session details
async function viewSessionDetails(sessionId) {
    try {
        const response = await TeacherAPI.getSessionAttendance(sessionId);
        
        alert(`Session Details:\n\nSubject: ${response.session.subject}\nDate: ${response.session.session_date}\nPresent: ${response.total_present}/${response.session.total_students}\n\nView detailed attendance in the session report.`);
        
    } catch (error) {
        alert('Failed to load session details');
    }
}

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

