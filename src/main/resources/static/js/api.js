// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Core API Functions
const API = {
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const user = Auth.getUser();
        if (user && user.accessToken) {
            headers['Authorization'] = `Bearer ${user.accessToken}`;
        }
        return headers;
    },

    handleResponse(response) {
        if (response.status === 401) {
            Auth.logout();
            throw new Error('Session expired. Please login again.');
        }
        return response;
    },

    // Generic GET request
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: this.getHeaders()
            });
            this.handleResponse(response);

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
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            this.handleResponse(response);

            const result = await response.json();
            if (!response.ok) {
                let errorMessage = result.message || 'Request failed';
                if (result.errors) {
                    if (Array.isArray(result.errors)) {
                        const validationErrors = result.errors.map(e => `• ${e.field}: ${e.defaultMessage}`).join('\n');
                        errorMessage += `\n${validationErrors}`;
                    } else if (typeof result.errors === 'object') {
                        // Handle Map<String, String>
                        const validationErrors = Object.entries(result.errors)
                            .map(([field, msg]) => `• ${field}: ${msg}`)
                            .join('\n');
                        errorMessage += `\n${validationErrors}`;
                    }
                }
                throw new Error(errorMessage);
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
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            this.handleResponse(response);

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
                method: 'DELETE',
                headers: this.getHeaders()
            });
            this.handleResponse(response);

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
            // Normalize keys for frontend usage
            const user = {
                ...result,
                id: result.userId,
                token: result.accessToken // Backward compatibility just in case
            };
            localStorage.setItem('user', JSON.stringify(user));
            return user;
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
