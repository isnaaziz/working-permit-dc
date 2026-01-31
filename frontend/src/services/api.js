// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Core API Functions
const api = {
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
    return headers;
  },

  handleResponse(response) {
    if (response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    return response;
  },

  // Generic GET request
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options
      });
      this.handleResponse(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      if (options.responseType === 'blob') {
        return await response.blob();
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
      const isFormData = data instanceof FormData;
      const headers = this.getHeaders();

      if (isFormData) {
        delete headers['Content-Type']; // Let browser set multipart/form-data with boundary
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      this.handleResponse(response);

      const result = await response.json();
      if (!response.ok) {
        let errorMessage = result.message || 'Request failed';
        if (result.errors) {
          if (Array.isArray(result.errors)) {
            const validationErrors = result.errors
              .map((e) => `${e.field}: ${e.defaultMessage}`)
              .join(', ');
            errorMessage += ` - ${validationErrors}`;
          } else if (typeof result.errors === 'object') {
            const validationErrors = Object.entries(result.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ');
            errorMessage += ` - ${validationErrors}`;
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
        body: JSON.stringify(data),
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
        headers: this.getHeaders(),
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
  },
};

export default api;
