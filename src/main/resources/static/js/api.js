// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Utility Functions
const API = {
    // Generic GET request
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    // Generic POST request
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }
            return result;
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    // Generic PUT request
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }
            return result;
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    // Generic DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

// Authentication Functions
const Auth = {
    async login(username, password) {
        const result = await API.post('/auth/login', { username, password });
        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result));
        }
        return result;
    },

    async register(userData) {
        return await API.post('/auth/register', userData);
    },

    logout() {
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
        }
    }
};

// Permit Functions
const Permits = {
    async create(permitData, visitorId) {
        return await API.post(`/permits?visitorId=${visitorId}`, permitData);
    },

    async getById(id) {
        return await API.get(`/permits/${id}`);
    },

    async getByNumber(permitNumber) {
        return await API.get(`/permits/number/${permitNumber}`);
    },

    async getByVisitor(visitorId) {
        return await API.get(`/permits/visitor/${visitorId}`);
    },

    async getByPIC(picId) {
        return await API.get(`/permits/pic/${picId}`);
    },

    async getByStatus(status) {
        return await API.get(`/permits/status/${status}`);
    },

    async getAll() {
        return await API.get('/permits');
    },

    async update(id, permitData) {
        return await API.put(`/permits/${id}`, permitData);
    },

    async cancel(id) {
        return await API.post(`/permits/${id}/cancel`, {});
    },

    async activate(id) {
        return await API.post(`/permits/${id}/activate`, {});
    },

    async regenerateOTP(id) {
        return await API.post(`/permits/${id}/regenerate-otp`, {});
    }
};

// Approval Functions
const Approvals = {
    async picReview(approvalData, picId) {
        return await API.post(`/approvals/pic/review?picId=${picId}`, approvalData);
    },

    async managerApprove(approvalData, managerId) {
        return await API.post(`/approvals/manager/approve?managerId=${managerId}`, approvalData);
    },

    async getPICPending(picId) {
        return await API.get(`/approvals/pic/${picId}/pending`);
    },

    async getManagerPending(managerId) {
        return await API.get(`/approvals/manager/${managerId}/pending`);
    },

    async getByPermit(permitId) {
        return await API.get(`/approvals/permit/${permitId}`);
    }
};

// Access Control Functions
const Access = {
    async verify(qrCodeData, otpCode) {
        return await API.post('/access/verify', { qrCodeData, otpCode });
    },

    async checkIn(checkInData) {
        return await API.post('/access/check-in', checkInData);
    },

    async checkOut(permitNumber) {
        return await API.post(`/access/check-out?permitNumber=${permitNumber}`, {});
    },

    async getLogs() {
        return await API.get('/access/logs');
    },

    async getPermitLogs(permitId) {
        return await API.get(`/access/logs/permit/${permitId}`);
    }
};

// Notification Functions
const Notifications = {
    async getUserNotifications(userId) {
        return await API.get(`/notifications/user/${userId}`);
    },

    async getUnread(userId) {
        return await API.get(`/notifications/user/${userId}/unread`);
    },

    async markAsRead(id) {
        return await API.post(`/notifications/${id}/read`, {});
    },

    async markAllAsRead(userId) {
        return await API.post(`/notifications/user/${userId}/read-all`, {});
    }
};

// User Functions
const Users = {
    async getById(id) {
        return await API.get(`/users/${id}`);
    },

    async getByRole(role) {
        return await API.get(`/users/role/${role}`);
    },

    async getAll() {
        return await API.get('/users');
    }
};

// UI Utility Functions
const UI = {
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },

    showLoading(show = true) {
        let spinner = document.getElementById('loading-spinner');
        if (show) {
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.id = 'loading-spinner';
                spinner.className = 'spinner';
                document.body.appendChild(spinner);
            }
        } else {
            if (spinner) {
                spinner.remove();
            }
        }
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getStatusBadge(status) {
        const badges = {
            'DRAFT': 'badge-info',
            'PENDING_PIC': 'badge-warning',
            'PENDING_MANAGER': 'badge-warning',
            'APPROVED': 'badge-success',
            'REJECTED': 'badge-danger',
            'ACTIVE': 'badge-success',
            'COMPLETED': 'badge-info',
            'CANCELLED': 'badge-danger',
            'EXPIRED': 'badge-danger'
        };
        return badges[status] || 'badge-info';
    }
};
