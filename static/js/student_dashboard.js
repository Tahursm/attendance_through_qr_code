// QR Scanner instance
let html5QrcodeScanner = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard page loading...');
    
    if (!isAuthenticated() || getUserType() !== 'student') {
        console.log('Not authenticated, redirecting to home');
        window.location.href = '/';
        return;
    }

    // Show cached profile immediately after login/registration
    // This ensures all registration details are displayed instantly
    const cachedProfile = getUserData();
    if (cachedProfile) {
        console.log('Loading cached profile data:', cachedProfile);
        // Always update profile with cached data first to ensure something is displayed
        updateProfile(cachedProfile);
    } else {
        console.warn('No cached profile data found on page load');
        // If no cached data, show loading state
        showLoadingState();
    }

    // Load fresh data from API to ensure all details are up-to-date
    // This fetches all student details including registration information
    // If API fails, cached data will remain displayed
    try {
        await loadDashboard();
    } catch (error) {
        console.error('Critical error loading dashboard:', error);
        // Ensure we still have data displayed
        const fallbackProfile = getUserData();
        if (fallbackProfile) {
            console.log('Using fallback cached data after error');
            updateProfile(fallbackProfile);
        }
    }
    
    // Show scanner instructions
    showScannerInstructions();
});

// Show loading state when no data is available
function showLoadingState() {
    const profileFields = ['profileFullName', 'profileStudentId', 'profileEmail', 'profileBranch', 'profileSemester', 'profileYear', 'profilePhone'];
    profileFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.textContent = 'Loading...';
        }
    });
}

// Load all dashboard data
async function loadDashboard() {
    let profileData = null;
    const token = getAuthToken();
    
    if (!token) {
        console.error('No authentication token found');
        const cachedProfile = getUserData();
        if (cachedProfile) {
            updateProfile(cachedProfile);
        }
        return;
    }
    
    try {
        console.log('Fetching dashboard data from API...');
        const stats = await StudentAPI.getDashboardStats();
        
        if (!stats) {
            console.error('No response from dashboard/stats API');
            throw new Error('No response from API');
        }
        
        if (!stats.profile) {
            console.error('Invalid dashboard data received - no profile field:', stats);
            // Fallback to profile endpoint
            throw new Error('Dashboard stats incomplete - missing profile');
        }
        
        console.log('Dashboard data received successfully:', {
            hasProfile: !!stats.profile,
            studentId: stats.profile?.student_id,
            fullName: stats.profile?.full_name
        });
        
        profileData = stats.profile;
        
        // Update profile information with all registration details
        // This ensures all fields entered during registration are displayed
        updateProfile(stats.profile);
        
        // Save updated profile to cache for faster loading next time
        // This ensures data persists across page reloads
        if (stats.profile) {
            console.log('Saving profile data to cache');
            saveAuthData(token, getUserType(), stats.profile);
        }
        
        // Update statistics
        if (stats.attendance) {
            updateStatistics(stats.attendance, stats.profile);
        }
        
        // Update subject-wise attendance
        if (stats.subject_wise_attendance) {
            updateSubjectAttendance(stats.subject_wise_attendance);
        }
        
        // Load attendance history (non-blocking)
        loadAttendanceHistory().catch(err => {
            console.error('Error loading attendance history:', err);
        });
        
        console.log('Dashboard loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Fallback: Try to get profile directly
        try {
            console.log('Attempting to fetch profile directly from /student/profile...');
            const profileResponse = await StudentAPI.getProfile();
            
            if (profileResponse && profileResponse.student) {
                console.log('Profile data received from profile endpoint:', {
                    studentId: profileResponse.student.student_id,
                    fullName: profileResponse.student.full_name
                });
                
                profileData = profileResponse.student;
                updateProfile(profileResponse.student);
                
                // Save to cache - CRITICAL for page reloads
                console.log('Saving profile data to cache from profile endpoint');
                saveAuthData(token, getUserType(), profileResponse.student);
                
                // Try to load attendance data separately (non-blocking)
                loadAttendanceHistory().catch(attError => {
                    console.error('Error loading attendance history:', attError);
                });
                
                console.log('Profile loaded successfully from fallback endpoint');
            } else {
                console.error('Profile endpoint returned invalid data:', profileResponse);
                throw new Error('Profile endpoint returned invalid data');
            }
        } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            console.error('Profile error details:', {
                message: profileError.message,
                stack: profileError.stack
            });
            
            // Last resort: Use cached data if available
            const cachedProfile = getUserData();
            if (cachedProfile) {
                console.log('Using cached profile data as final fallback');
                console.log('Cached data:', {
                    studentId: cachedProfile.student_id,
                    fullName: cachedProfile.full_name
                });
                updateProfile(cachedProfile);
            } else {
                console.error('No cached data available and all API calls failed');
                console.error('Available localStorage keys:', Object.keys(localStorage));
                showAlert('scannerAlert', 'Failed to load student details. Please try logging in again.', 'danger');
            }
        }
    }
}

// Update profile information
function updateProfile(profile) {
    if (!profile) {
        console.error('Profile data is missing');
        // Try to get from cache as last resort
        const cachedProfile = getUserData();
        if (cachedProfile) {
            console.log('Using cached profile as fallback');
            profile = cachedProfile;
        } else {
            console.error('No profile data available');
            return;
        }
    }
    
    // Validate essential fields
    if (!profile.student_id && !profile.teacher_id) {
        console.error('Profile missing ID field:', profile);
        return;
    }
    
    console.log('Updating profile with data:', {
        studentId: profile.student_id,
        fullName: profile.full_name,
        email: profile.email
    });
    
    // Update navbar - ensure name is always displayed
    const fullName = profile.full_name || 'Student';
    const nameElement = document.getElementById('studentName');
    const welcomeElement = document.getElementById('welcomeName');
    if (nameElement) {
        nameElement.textContent = fullName;
        console.log('Updated navbar name:', fullName);
    }
    if (welcomeElement) {
        welcomeElement.textContent = fullName;
        console.log('Updated welcome name:', fullName);
    }
    
    // Update profile section - ensure all registration fields are displayed
    // Use safe defaults for all fields
    const profileFields = {
        'profileFullName': profile.full_name || 'Not available',
        'profileStudentId': profile.student_id || 'Not available',
        'profileEmail': profile.email || 'Not available',
        'profileBranch': profile.branch || 'Not available',
        'profileSemester': profile.semester !== undefined && profile.semester !== null ? profile.semester : 'Not available',
        'profileYear': profile.year !== undefined && profile.year !== null ? profile.year : 'Not available',
        'profilePhone': profile.phone || 'Not available'
    };
    
    // Update each profile field
    let fieldsUpdated = 0;
    Object.keys(profileFields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.textContent = profileFields[fieldId];
            fieldsUpdated++;
        } else {
            console.warn(`Element not found for field: ${fieldId}`);
        }
    });
    console.log(`Updated ${fieldsUpdated} profile fields`);
    
    // Update fee details with safe defaults
    const totalFee = parseFloat(profile.total_fee) || 0;
    const paidFee = parseFloat(profile.paid_fee) || 0;
    const remaining = Math.max(0, totalFee - paidFee);
    
    const totalFeeElement = document.getElementById('totalFee');
    const paidFeeElement = document.getElementById('paidFee');
    const remainingFeeElement = document.getElementById('remainingFee');
    
    if (totalFeeElement) totalFeeElement.textContent = `₹${totalFee.toLocaleString('en-IN')}`;
    if (paidFeeElement) paidFeeElement.textContent = `₹${paidFee.toLocaleString('en-IN')}`;
    if (remainingFeeElement) remainingFeeElement.textContent = `₹${remaining.toLocaleString('en-IN')}`;
    
    // Update fee status badge
    const feeStatusElement = document.getElementById('feeStatus');
    if (feeStatusElement) {
        const feeStatus = profile.fee_status || 'Pending';
        let badgeClass = 'badge-warning';
        if (feeStatus === 'Paid') badgeClass = 'badge-success';
        else if (feeStatus === 'Partial') badgeClass = 'badge-warning';
        else badgeClass = 'badge-danger';
        
        feeStatusElement.innerHTML = `<span class="badge ${badgeClass}">${feeStatus}</span>`;
    }
    
    // Update backlogs and CGPA with safe defaults
    const backlogsElement = document.getElementById('backlogs');
    const cgpaElement = document.getElementById('cgpa');
    
    if (backlogsElement) {
        const backlogs = parseInt(profile.backlogs) || 0;
        backlogsElement.textContent = backlogs;
    }
    if (cgpaElement) {
        const cgpa = parseFloat(profile.cgpa) || 0;
        cgpaElement.textContent = cgpa.toFixed(2);
    }
    
    console.log('Profile update completed successfully');
}

// Update statistics
function updateStatistics(attendance, profile) {
    document.getElementById('attendancePercentage').textContent = `${attendance.percentage}%`;
    document.getElementById('totalSessions').textContent = attendance.total_sessions;
    
    // Update stat card color based on attendance percentage
    const attendanceCard = document.querySelector('.stat-card.success');
    if (attendance.percentage < 75) {
        attendanceCard.classList.remove('success');
        attendanceCard.classList.add('danger');
    }
}

// Update subject-wise attendance
function updateSubjectAttendance(subjectAttendance) {
    const container = document.getElementById('subjectAttendanceContainer');
    
    if (!subjectAttendance || subjectAttendance.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No attendance records found</p>';
        return;
    }
    
    let html = '<div class="info-grid">';
    
    subjectAttendance.forEach(subject => {
        let badgeClass = 'badge-success';
        if (subject.percentage < 75) badgeClass = 'badge-danger';
        else if (subject.percentage < 85) badgeClass = 'badge-warning';
        
        html += `
            <div class="info-item">
                <label>${subject.subject}</label>
                <div class="value">
                    <span class="badge ${badgeClass}">${subject.percentage}%</span>
                    <br>
                    <small style="color: #6b7280;">${subject.present}/${subject.total_sessions} sessions</small>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Load attendance history
async function loadAttendanceHistory() {
    try {
        const response = await StudentAPI.getAttendance();
        const tbody = document.getElementById('attendanceTableBody');
        
        if (!response.attendance || response.attendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No attendance records found</td></tr>';
            return;
        }
        
        let html = '';
        response.attendance.forEach(record => {
            const date = new Date(record.session_date).toLocaleDateString();
            const time = record.marked_at ? new Date(record.marked_at).toLocaleTimeString() : 'N/A';
            const statusClass = record.status === 'Present' ? 'badge-success' : 'badge-danger';
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${record.subject}</td>
                    <td><span class="badge ${statusClass}">${record.status}</span></td>
                    <td>${time}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading attendance history:', error);
        document.getElementById('attendanceTableBody').innerHTML = 
            '<tr><td colspan="4" style="text-align: center; color: red;">Failed to load attendance history</td></tr>';
    }
}

// Start QR code scanner with camera (mobile-friendly version)
async function startScanner() {
    try {
        // Check if HTML5 QR Code library is loaded
        if (typeof Html5Qrcode === 'undefined') {
            throw new Error('QR scanner library not loaded. Please refresh the page and try again.');
        }
        
        // Check if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Always try mobile-friendly approach first
        showAlert('scannerAlert', '📷 Requesting camera access...', 'info', true);
        
        // Small delay to show message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Hide scan button, show camera section
        document.getElementById('scanBtn').style.display = 'none';
        document.getElementById('cameraSection').style.display = 'block';
        document.getElementById('scannerAlert').innerHTML = '';
        
        // Initialize scanner
        html5QrcodeScanner = new Html5Qrcode("qr-reader");
        
        // Get available cameras with better error handling
        let cameras = [];
        try {
            cameras = await Html5Qrcode.getCameras();
        } catch (cameraError) {
            console.error('Camera enumeration error:', cameraError);
            throw new Error('Unable to access camera. Please ensure camera permissions are granted.');
        }
        
        if (!cameras || cameras.length === 0) {
            throw new Error('No cameras found on this device. Please ensure your device has a camera.');
        }
        
        // Prefer back camera if available
        const backCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('rear') ||
            camera.label.toLowerCase().includes('environment')
        );
        
        const cameraId = backCamera ? backCamera.id : cameras[0].id;
        
        console.log('Available cameras:', cameras.map(c => c.label));
        console.log('Using camera:', backCamera ? backCamera.label : cameras[0].label);
        
        // Start scanning with better error handling
        try {
            await html5QrcodeScanner.start(
                cameraId,
                {
                    fps: 10,    // Frames per second
                    qrbox: { width: 250, height: 250 },  // Scanning box size
                    aspectRatio: 1.0  // Square aspect ratio for better QR detection
                },
                onScanSuccess,
                onScanFailure
            );
            
            showAlert('scannerAlert', '📷 Camera active - Point at QR code', 'success', true);
            
        } catch (startError) {
            console.error('Camera start error:', startError);
            
            // Try with different camera if first one fails
            if (cameras.length > 1) {
                console.log('Trying alternative camera...');
                const alternativeCameraId = cameras[1].id;
                
                try {
                    await html5QrcodeScanner.start(
                        alternativeCameraId,
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        onScanSuccess,
                        onScanFailure
                    );
                    
                    showAlert('scannerAlert', '📷 Camera active - Point at QR code', 'success', true);
                    
                } catch (altError) {
                    console.error('Alternative camera also failed:', altError);
                    throw new Error('Camera access denied. Please grant camera permissions and try again.');
                }
            } else {
                throw new Error('Camera access denied. Please grant camera permissions and try again.');
            }
        }
        
    } catch (error) {
        console.error('Scanner error:', error);
        
        // Better error messages
        let errorMessage = 'Camera access failed. ';
        
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
            errorMessage += 'Please grant camera permissions in your browser settings and try again.';
        } else if (error.message.includes('NotFoundError')) {
            errorMessage += 'No camera found on this device.';
        } else if (error.message.includes('NotSupportedError')) {
            errorMessage += 'Camera not supported on this device.';
        } else if (error.message.includes('NotReadableError')) {
            errorMessage += 'Camera is being used by another application.';
        } else {
            errorMessage += error.message || 'Please ensure camera access is enabled.';
        }
        
        showAlert('scannerAlert', `❌ ${errorMessage}`, 'danger');
        
        // Show manual input option as fallback
        setTimeout(() => {
            const scannerAlert = document.getElementById('scannerAlert');
            if (scannerAlert) {
                scannerAlert.innerHTML += `
                    <div style="padding: 15px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin-top: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: #1e40af;">📝 Manual QR Code Entry</h4>
                        <p style="margin: 0 0 10px 0; color: #1e40af;">
                            If camera is not working, you can manually enter the QR code data.
                        </p>
                        <input type="text" id="manualQRInput" placeholder="Enter QR code data here..." 
                               style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
                        <button onclick="processManualQR()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                            Submit QR Data
                        </button>
                    </div>
                `;
            }
        }, 2000);
        
        stopScanner();
    }
}

// Stop QR code scanner
async function stopScanner() {
    try {
        if (html5QrcodeScanner) {
            await html5QrcodeScanner.stop();
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }
    } catch (error) {
        console.error('Error stopping scanner:', error);
    }
    
    // Show scan button, hide camera section
    document.getElementById('scanBtn').style.display = 'block';
    document.getElementById('cameraSection').style.display = 'none';
}

// Callback when QR code is successfully scanned
async function onScanSuccess(decodedText, decodedResult) {
    // Stop scanner immediately
    await stopScanner();
    
    // Show what was scanned
    showAlert('scannerAlert', '✓ QR Code detected! Processing...', 'success', true);
    
    // Mark attendance with scanned data
    await markAttendanceWithData(decodedText);
}

// Callback for scan failures (can be ignored)
function onScanFailure(error) {
    // This is called very frequently, so we don't show errors
    // Only log to console if needed
    // console.warn('Scan error:', error);
}

// Mark attendance with QR data (works for both camera and manual)
async function markAttendanceWithData(qrData) {
    if (!qrData) {
        showAlert('scannerAlert', 'No QR code data provided', 'danger');
        return;
    }
    
    try {
        // Get location if available
        let latitude = null;
        let longitude = null;
        
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (geoError) {
                console.log('Location access denied or unavailable');
            }
        }
        
        // Mark attendance
        const response = await AttendanceAPI.markAttendance({
            qr_data: qrData,
            latitude,
            longitude
        });
        
        showAlert('scannerAlert', `✓ ${response.message} - ${response.session.subject}`, 'success');
        
        // Reload dashboard data
        setTimeout(() => {
            loadDashboard();
        }, 2000);
        
    } catch (error) {
        showAlert('scannerAlert', error.message || 'Failed to mark attendance', 'danger');
    }
}

// ========== WiFi Detection for Attendance ==========

// Get current WiFi SSID (Note: This requires special browser APIs or extensions)
async function getWiFiInfo() {
    // Note: Browser security prevents direct WiFi SSID access
    // This would typically require a browser extension or native app
    // For demo purposes, we'll prompt the user or use a workaround
    
    try {
        // Attempt to get network information if available
        if ('connection' in navigator) {
            // Limited network info available
            return {
                wifi_ssid: prompt('Please enter the WiFi network name (SSID) you are connected to:'),
                wifi_bssid: null
            };
        }
    } catch (error) {
        console.error('WiFi detection error:', error);
    }
    
    // Fallback: Ask user to enter manually
    return {
        wifi_ssid: prompt('Please enter the WiFi network name (SSID) you are connected to:'),
        wifi_bssid: null
    };
}

// Mark attendance with QR data (UPDATED with WiFi validation)
async function markAttendanceWithData(qrData) {
    if (!qrData) {
        showAlert('scannerAlert', 'No QR code data provided', 'danger');
        return;
    }
    
    try {
        // Get WiFi information
        const wifiInfo = await getWiFiInfo();
        
        if (!wifiInfo.wifi_ssid) {
            showAlert('scannerAlert', 'WiFi SSID is required to mark attendance', 'danger');
            return;
        }
        
        // Get location if available
        let latitude = null;
        let longitude = null;
        
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (geoError) {
                console.log('Location access denied or unavailable');
            }
        }
        
        // Mark attendance with WiFi info
        const response = await AttendanceAPI.markAttendance({
            qr_data: qrData,
            latitude,
            longitude,
            wifi_ssid: wifiInfo.wifi_ssid,
            wifi_bssid: wifiInfo.wifi_bssid
        });
        
        showAlert('scannerAlert', 
            `✓ ${response.message} - ${response.session.subject}<br>WiFi: ${response.wifi_location}`, 
            'success'
        );
        
        // Reload dashboard data
        setTimeout(() => {
            loadDashboard();
        }, 2000);
        
    } catch (error) {
        showAlert('scannerAlert', error.message || 'Failed to mark attendance', 'danger');
    }
}

// Show scanner instructions
function showScannerInstructions() {
    const scannerAlert = document.getElementById('scannerAlert');
    if (!scannerAlert) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const manualEntryBlock = `
        <div id="manualQRInfo" style="padding: 15px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">📝 Manual QR Code Entry</h4>
            <p style="margin: 0 0 10px 0; color: #1e40af;">
                If the camera is unavailable, ask your teacher for the QR code data and enter it manually:
            </p>
            <input type="text" id="manualQRInput" placeholder="Enter QR code data here..." 
                   style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
            <button onclick="processManualQR()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                Submit QR Data
            </button>
        </div>
    `;

    if (isMobile) {
        scannerAlert.innerHTML = `
            <div id="mobileScannerInfo" style="padding: 15px; background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📱 Mobile QR Scanner Ready</h4>
                <p style="margin: 0 0 10px 0; color: #1e40af;">
                    Tap "Scan QR Code" to open the camera. Grant permission if prompted.
                </p>
                <button id="cameraPermissionBtn" onclick="requestCameraPermission()" style="background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    📷 Request Camera Permission
                </button>
            </div>
            ${manualEntryBlock}
        `;
    } else {
        scannerAlert.innerHTML = `
            <div style="padding: 15px; background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">✅ Scan QR Codes Instantly</h4>
                <p style="margin: 0 0 10px 0; color: #065f46;">
                    Click "Scan QR Code" to open the built-in scanner.
                </p>
            </div>
            ${manualEntryBlock}
        `;
    }
}

// Force camera permission request
async function requestCameraPermission() {
    try {
        showAlert('scannerAlert', '📷 Requesting camera permission...', 'info', true);
        
        // Try to access camera directly to trigger permission request
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment' // Prefer back camera
            } 
        });
        
        // If we get here, permission was granted
        showAlert('scannerAlert', '✅ Camera permission granted! You can now scan QR codes.', 'success', true);
        
        // Stop the stream immediately (we just needed permission)
        stream.getTracks().forEach(track => track.stop());
        
        // Enable the scan button
        setTimeout(() => {
            const scanBtn = document.getElementById('scanBtn');
            if (scanBtn) {
                scanBtn.style.display = 'block';
            }
        }, 2000);
        
    } catch (error) {
        console.error('Camera permission error:', error);
        
        if (error.name === 'NotAllowedError') {
            showAlert('scannerAlert', '❌ Camera permission denied. Please allow camera access in your browser settings.', 'danger');
        } else if (error.name === 'NotFoundError') {
            showAlert('scannerAlert', '❌ No camera found on this device.', 'danger');
        } else {
            showAlert('scannerAlert', `❌ Camera error: ${error.message}`, 'danger');
        }
    }
}

// Process manually entered QR code data
async function processManualQR() {
    const qrInput = document.getElementById('manualQRInput');
    const qrData = qrInput ? qrInput.value.trim() : '';
    
    if (!qrData) {
        showAlert('scannerAlert', 'Please enter QR code data', 'danger');
        return;
    }
    
    try {
        showAlert('scannerAlert', 'Processing QR code data...', 'info', true);
        
        // Use the same attendance marking function
        await markAttendanceWithData(qrData);
        
        // Clear the manual input
        if (qrInput) {
            qrInput.value = '';
        }
        
    } catch (error) {
        console.error('Manual QR processing error:', error);
        showAlert('scannerAlert', `❌ Error processing QR data: ${error.message}`, 'danger');
    }
}

// Cleanup when leaving page
window.addEventListener('beforeunload', () => {
    if (html5QrcodeScanner) {
        stopScanner();
    }
});

