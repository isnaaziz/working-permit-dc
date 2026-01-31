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

  // Get teams for dropdown
  async getTeams() {
    return [
      { id: 'TIM_ODC', name: 'Tim ODC' },
      { id: 'TIM_INFRA', name: 'Tim INFRA' },
      { id: 'TIM_NETWORK', name: 'Tim Network' },
      { id: 'TIM_SECURITY', name: 'Tim Security' },
    ];
  },

  // Get PIC users by team
  async getPICUsersByTeam(team) {
    const allPIC = await api.get('/users/role/PIC');
    return allPIC.filter(u => u.team === team);
  },

  // Get administrator users
  async getAdministrators() {
    const roles = ['ADMINISTRATOR_ODC', 'ADMINISTRATOR_INFRA', 'ADMINISTRATOR_NETWORK'];
    const admins = [];
    for (const role of roles) {
      try {
        const users = await api.get(`/users/role/${role}`);
        admins.push(...users);
      } catch (e) {
        // Role might not have any users
      }
    }
    return admins;
  },
};

export default userService;
