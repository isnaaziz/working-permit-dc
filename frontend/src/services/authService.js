import api from './api';

// Authentication Service
export const authService = {
  async login(username, password) {
    const result = await api.post('/auth/login', { username, password });
    if (result.success) {
      const user = {
        ...result,
        id: result.userId,
        token: result.accessToken,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error(result.message || 'Login failed');
  },

  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async refreshToken(refreshToken) {
    return await api.post('/auth/refresh', { refreshToken });
  },

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    const user = this.getUser();
    return user && user.accessToken;
  },

  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  hasRole(role) {
    return this.getRole() === role;
  },
};

export default authService;
