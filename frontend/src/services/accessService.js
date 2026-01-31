import api from './api';

// Access Control Service
export const accessService = {
  // Scan OTP barcode and verify
  async scanOTP(scannedCode) {
    return await api.post('/access/scan-otp', { scannedCode });
  },

  // Check-in after OTP scan verification
  async scanCheckIn(permitId, notes = '') {
    return await api.post('/access/scan-checkin', { permitId, notes });
  },

  // Check-out via scan
  async scanCheckOut(permitId, notes = '') {
    return await api.post('/access/scan-checkout', { permitId, notes });
  },

  // Get scanner status
  async getScannerStatus() {
    return await api.get('/access/scanner-status');
  },

  async verify(qrCodeData, otpCode) {
    return await api.post('/access/verify', { qrCodeData, otpCode });
  },

  async checkIn(checkInData) {
    return await api.post('/access/check-in', checkInData);
  },

  async checkOut(permitId, location = 'Main Gate') {
    // Use scan-checkout endpoint which is more reliable (doesn't require ID card)
    return await api.post('/access/scan-checkout', { permitId, notes: `Checkout at ${location}` });
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

  // Get today's check-in logs
  async getTodayCheckIns() {
    return await api.get('/access/logs/today/checkins');
  },

  // Get today's check-out logs
  async getTodayCheckOuts() {
    return await api.get('/access/logs/today/checkouts');
  },

  // Get access statistics for today
  async getStats() {
    return await api.get('/access/stats');
  },

  // Get currently checked-in visitors (active in data center)
  async getCheckedInVisitors() {
    return await api.get('/access/checked-in');
  },
};

export default accessService;
