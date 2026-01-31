import api from './api';

// Permit Service
export const permitService = {
  async create(permitData, visitorId) {
    return await api.post(`/permits?visitorId=${visitorId}`, permitData);
  },

  async getById(id) {
    return await api.get(`/permits/${id}`);
  },

  async getByNumber(permitNumber) {
    return await api.get(`/permits/number/${permitNumber}`);
  },

  async getByVisitor(visitorId) {
    return await api.get(`/permits/visitor/${visitorId}`);
  },

  async getByPIC(picId) {
    return await api.get(`/permits/pic/${picId}`);
  },

  async getByStatus(status) {
    return await api.get(`/permits/status/${status}`);
  },

  async getAll() {
    return await api.get('/permits');
  },

  async update(id, permitData) {
    return await api.put(`/permits/${id}`, permitData);
  },

  async cancel(id, reason = '') {
    return await api.post(`/permits/${id}/cancel?reason=${encodeURIComponent(reason)}`, {});
  },

  async activate(id) {
    return await api.post(`/permits/${id}/activate`, {});
  },

  async regenerateOTP(id) {
    return await api.post(`/permits/${id}/regenerate-otp`, {});
  },

  async uploadDocument(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(`/permits/${id}/upload`, formData);
  },

  async viewDocument(id) {
    const response = await fetch(`${api.defaults?.baseURL || (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')}/permits/${id}/document`, {
      headers: api.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }
    return await response.blob();
  },
};

export default permitService;
