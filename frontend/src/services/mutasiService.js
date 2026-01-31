import api from './api';

const mutasiService = {
  // CRUD
  async createMutasiBarang(data) {
    return api.post('/mutasi-barang', data);
  },
  async getAll() {
    return api.get('/mutasi-barang');
  },
  async getById(id) {
    return api.get(`/mutasi-barang/${id}`);
  },
  async update(id, data) {
    return api.put(`/mutasi-barang/${id}`, data);
  },
  async remove(id) {
    return api.delete(`/mutasi-barang/${id}`);
  },

  // Approvals
  async getPending() {
    return api.get('/mutasi-barang/pending');
  },
  async approvePIC(id, notes = '') {
    return api.post(`/mutasi-barang/${id}/approve/pic`, { notes });
  },
  async approveManager(id, notes = '') {
    return api.post(`/mutasi-barang/${id}/approve/manager`, { notes });
  },
  async reject(id, reason) {
    return api.post(`/mutasi-barang/${id}/reject`, { reason });
  },
  async complete(id) {
    return api.post(`/mutasi-barang/${id}/complete`, {});
  },

  // Stats
  async getStats() {
    return api.get('/mutasi-barang/stats');
  },

  // Teams
  async getTeams() {
    return api.get('/mutasi-barang/teams');
  },

  async uploadDocument(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/mutasi-barang/${id}/upload`, formData);
  },
};

export default mutasiService;
