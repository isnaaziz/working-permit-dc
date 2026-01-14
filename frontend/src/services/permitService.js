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
};

export default permitService;
