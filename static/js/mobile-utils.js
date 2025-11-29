// Mobile-friendly utilities for Smart Attendance System

// ============================================
// Service Worker Registration
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Show update notification
function showUpdateNotification() {
    if (confirm('A new version is available! Reload to update?')) {
        window.location.reload();
    }
}

// ============================================
// PWA Install Prompt
// ============================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button/banner
    showInstallPromotion();
});

function showInstallPromotion() {
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'installBanner';
    installBanner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #2563eb;
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 9999;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease-out;
    `;
    
    installBanner.innerHTML = `
        <div style="flex: 1;">
            <strong>Install App</strong>
            <p style="margin: 0; font-size: 0.875rem;">Get quick access from your home screen</p>
        </div>
        <button id="installBtn" style="
            background: white;
            color: #2563eb;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 0.5rem;
        ">Install</button>
        <button id="dismissBtn" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            cursor: pointer;
        ">✕</button>
    `;
    
    document.body.appendChild(installBanner);
    
    // Install button click
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            installBanner.remove();
        }
    });
    
    // Dismiss button click
    document.getElementById('dismissBtn').addEventListener('click', () => {
        installBanner.remove();
        localStorage.setItem('installPromptDismissed', 'true');
    });
    
    // Don't show if previously dismissed
    if (localStorage.getItem('installPromptDismissed') === 'true') {
        installBanner.remove();
    }
}

// Add slideUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ============================================
// Network Status Detection
// ============================================
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const statusElement = document.getElementById('networkStatus');
    
    if (!statusElement) {
        const banner = document.createElement('div');
        banner.id = 'networkStatus';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 0.5rem;
            text-align: center;
            z-index: 10000;
            font-weight: 600;
            font-size: 0.875rem;
            transition: transform 0.3s ease;
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }
    
    const banner = document.getElementById('networkStatus');
    
    if (!isOnline) {
        banner.style.background = '#ef4444';
        banner.style.color = 'white';
        banner.textContent = '📡 No Internet Connection - Working Offline';
        banner.style.transform = 'translateY(0)';
    } else {
        banner.style.background = '#10b981';
        banner.style.color = 'white';
        banner.textContent = '✓ Back Online';
        banner.style.transform = 'translateY(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            banner.style.transform = 'translateY(-100%)';
        }, 3000);
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// ============================================
// Touch Gestures Support
// ============================================
class TouchGestureHandler {
    constructor(element) {
        this.element = element;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    handleTouchStart(e) {
        this.startX = e.changedTouches[0].screenX;
        this.startY = e.changedTouches[0].screenY;
    }
    
    handleTouchEnd(e) {
        this.endX = e.changedTouches[0].screenX;
        this.endY = e.changedTouches[0].screenY;
        this.handleGesture();
    }
    
    handleGesture() {
        const diffX = this.endX - this.startX;
        const diffY = this.endY - this.startY;
        
        // Swipe detection threshold
        const threshold = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        }
    }
    
    onSwipeRight() {
        // Override in implementation
        console.log('Swipe right detected');
    }
    
    onSwipeLeft() {
        // Override in implementation
        console.log('Swipe left detected');
    }
}

// ============================================
// Viewport Height Fix for Mobile Browsers
// ============================================
function setViewportHeight() {
    // Fix for mobile browsers where 100vh includes address bar
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();

// ============================================
// Prevent Pull-to-Refresh on iOS
// ============================================
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY;
    
    // Prevent pull-to-refresh if at top of page and pulling down
    if (touchDiff > 0 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

// ============================================
// Camera Permission Helper
// ============================================
async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        return true;
    } catch (error) {
        console.error('Camera permission denied:', error);
        
        // Show user-friendly message
        showAlert('Camera access is required to scan QR codes. Please enable camera permissions in your browser settings.', 'warning');
        
        return false;
    }
}

// ============================================
// Haptic Feedback (Vibration API)
// ============================================
function hapticFeedback(pattern = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Success feedback
function hapticSuccess() {
    hapticFeedback([50, 50, 50]);
}

// Error feedback
function hapticError() {
    hapticFeedback([100, 50, 100]);
}

// Light tap feedback
function hapticTap() {
    hapticFeedback(10);
}

// ============================================
// Screen Wake Lock (keep screen on during QR scanning)
// ============================================
let wakeLock = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
            
            wakeLock.addEventListener('release', () => {
                console.log('Screen wake lock released');
            });
        }
    } catch (error) {
        console.error('Wake lock error:', error);
    }
}

async function releaseWakeLock() {
    if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
    }
}

// ============================================
// Share API for Mobile
// ============================================
async function shareAttendance(data) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Attendance Report',
                text: data.text || 'Check out my attendance report',
                url: data.url || window.location.href
            });
            console.log('Share successful');
        } catch (error) {
            console.log('Share failed:', error);
        }
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(data.url || window.location.href);
        showAlert('Link copied to clipboard!', 'success');
    }
}

// Copy to clipboard helper
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// ============================================
// Mobile Alert Helper
// ============================================
function showAlert(targetElementId, message, type = 'info', preserveContent = false) {
    // If targetElementId is provided, show alert in that element
    if (targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            // Create alert div
            const alertDiv = document.createElement('div');
            alertDiv.className = `mobile-alert alert-${type}`;
            alertDiv.innerHTML = message;
            alertDiv.style.cssText = `
                padding: 1rem 1.5rem;
                border-radius: 8px;
                margin-bottom: 15px;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                animation: slideDown 0.3s ease-out;
            `;
            
            // Color based on type
            const colors = {
                success: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
                error: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
                warning: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
                info: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' }
            };
            
            alertDiv.style.background = colors[type].bg;
            alertDiv.style.color = colors[type].color;
            alertDiv.style.border = `2px solid ${colors[type].border}`;
            
            if (preserveContent) {
                // Insert at the beginning, preserving existing content
                targetElement.insertBefore(alertDiv, targetElement.firstChild);
            } else {
                // Replace content
                targetElement.innerHTML = '';
                targetElement.appendChild(alertDiv);
            }
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                alertDiv.style.animation = 'slideDown 0.3s ease-out reverse';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }, 5000);
            
            // Haptic feedback
            hapticTap();
            return;
        }
    }
    
    // Fallback: Show as floating alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `mobile-alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10001;
        max-width: 90%;
        text-align: center;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease-out;
    `;
    
    // Color based on type
    const colors = {
        success: { bg: '#10b981', color: 'white' },
        error: { bg: '#ef4444', color: 'white' },
        warning: { bg: '#f59e0b', color: 'white' },
        info: { bg: '#2563eb', color: 'white' }
    };
    
    alertDiv.style.background = colors[type].bg;
    alertDiv.style.color = colors[type].color;
    
    document.body.appendChild(alertDiv);
    
    // Add animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
    
    // Haptic feedback
    hapticTap();
}

// ============================================
// Export utilities
// ============================================
window.MobileUtils = {
    TouchGestureHandler,
    requestCameraPermission,
    hapticFeedback,
    hapticSuccess,
    hapticError,
    hapticTap,
    requestWakeLock,
    releaseWakeLock,
    shareAttendance,
    copyToClipboard,
    showAlert
};

console.log('Mobile utilities loaded successfully');

