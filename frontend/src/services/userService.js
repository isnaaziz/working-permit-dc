import api from './api';

// User Service
export const userService = {
  async getById(id) {
    return await api.get(`/users/${id}`);
  },

  async getByUsername(username) {
    return await api.get(`/users/username/${username}`);
  },

  async getByRole(role) {
    return await api.get(`/users/role/${role}`);
  },

  async getAll() {
    return await api.get('/users');
  },

  async update(id, updates) {
    return await api.put(`/users/${id}`, updates);
  },

  // Get PIC users for dropdown
  async getPICUsers() {
    return await api.get('/users/role/PIC');
  },

  // Get Manager users for dropdown
  async getManagers() {
    return await api.get('/users/role/MANAGER');
  },
};

export default userService;
