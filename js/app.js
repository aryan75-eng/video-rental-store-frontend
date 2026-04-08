// Change this to your deployed Railway backend URL once it is running
const PROD_API_URL = 'https://video-rental-store-backend-production.up.railway.app/api'; 

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8080/api' 
    : PROD_API_URL;

// Fetch and display all videos
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE_URL}/videos`);
        const videos = await response.json();
        displayInventory(videos);
    } catch (error) {
        console.error('Error loading inventory:', error);
        showError('Failed to load inventory');
    }
}

// Display videos in the inventory panel
function displayInventory(videos) {
    const inventoryDiv = document.getElementById('inventoryList');
    
    if (videos.length === 0) {
        inventoryDiv.innerHTML = '<div class="loading">No videos in inventory</div>';
        return;
    }
    
    inventoryDiv.innerHTML = videos.map(video => `
        <div class="video-item ${video.rented ? 'rented' : ''}">
            <div class="video-info">
                <div class="video-title">${escapeHtml(video.title)}</div>
                <div class="video-status">
                    Status: <span class="${video.rented ? 'status-rented' : 'status-available'}">
                        ${video.rented ? 'Rented Out' : 'Available'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load audit logs
async function loadAuditLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/audits`);
        const logs = await response.json();
        displayAuditLogs(logs);
    } catch (error) {
        console.error('Error loading audit logs:', error);
    }
}

// Display audit logs
function displayAuditLogs(logs) {
    const auditDiv = document.getElementById('auditLog');
    
    if (logs.length === 0) {
        auditDiv.innerHTML = '<div class="loading">No activity logs yet</div>';
        return;
    }
    
    auditDiv.innerHTML = logs.map(log => `
        <div class="audit-item">
            <div class="audit-action">${escapeHtml(log.actionType)}: ${escapeHtml(log.videoTitle)}</div>
            <div class="audit-details">${escapeHtml(log.details)}</div>
            <div class="audit-time">${new Date(log.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

// Add a new video
async function addVideo() {
    const titleInput = document.getElementById('videoTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        showError('Please enter a video title');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`"${title}" added successfully!`);
            titleInput.value = '';
            await loadInventory();
            await loadAuditLogs();
        } else {
            showError(result.error || 'Failed to add video');
        }
    } catch (error) {
        showError('Error adding video: ' + error.message);
    }
}

// Remove a video
async function removeVideo() {
    const titleInput = document.getElementById('videoTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        showError('Please enter a video title');
        return;
    }
    
    if (!confirm(`Are you sure you want to remove "${title}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`"${title}" removed successfully!`);
            titleInput.value = '';
            await loadInventory();
            await loadAuditLogs();
        } else {
            showError(result.error || 'Failed to remove video');
        }
    } catch (error) {
        showError('Error removing video: ' + error.message);
    }
}

// Rent a video
async function rentVideo() {
    const titleInput = document.getElementById('videoTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        showError('Please enter a video title');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/rent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`"${title}" rented successfully!`);
            titleInput.value = '';
            await loadInventory();
            await loadAuditLogs();
        } else {
            showError(result.error || 'Failed to rent video');
        }
    } catch (error) {
        showError('Error renting video: ' + error.message);
    }
}

// Return a video
async function returnVideo() {
    const titleInput = document.getElementById('videoTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        showError('Please enter a video title');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videos/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`"${title}" returned successfully!`);
            titleInput.value = '';
            await loadInventory();
            await loadAuditLogs();
        } else {
            showError(result.error || 'Failed to return video');
        }
    } catch (error) {
        showError('Error returning video: ' + error.message);
    }
}

// Helper function to show success message
function showSuccess(message) {
    showNotification(message, 'success');
}

// Helper function to show error message
function showError(message) {
    showNotification(message, 'error');
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadAuditLogs();
    
    // Refresh inventory and logs every 5 seconds
    setInterval(() => {
        loadInventory();
        loadAuditLogs();
    }, 5000);
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
