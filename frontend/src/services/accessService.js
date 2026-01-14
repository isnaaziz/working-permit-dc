import api from './api';

// Access Control Service
export const accessService = {
  async verify(qrCodeData, otpCode) {
    return await api.post('/access/verify', { qrCodeData, otpCode });
  },

  async checkIn(checkInData) {
    return await api.post('/access/check-in', checkInData);
  },

  async checkOut(permitId, location = 'Main Gate') {
    return await api.post(`/access/check-out?permitId=${permitId}&location=${encodeURIComponent(location)}`, {});
  },

  async recordDoorAccess(rfidTag, location, accessType = 'ENTRY') {
    return await api.post(`/access/door?rfidTag=${rfidTag}&location=${encodeURIComponent(location)}&accessType=${accessType}`, {});
  },

  async getLogs() {
    return await api.get('/access/logs');
  },

  async getPermitLogs(permitId) {
    return await api.get(`/access/logs/permit/${permitId}`);
  },
};

export default accessService;
