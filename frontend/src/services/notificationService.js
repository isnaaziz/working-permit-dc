import api from './api';

// Notification Service
export const notificationService = {
  async getUserNotifications(userId) {
    return await api.get(`/notifications/user/${userId}`);
  },

  async getUnread(userId) {
    return await api.get(`/notifications/user/${userId}/unread`);
  },

  async markAsRead(id) {
    return await api.post(`/notifications/${id}/read`, {});
  },

  async markAllAsRead(userId) {
    return await api.post(`/notifications/user/${userId}/read-all`, {});
  },

  async getById(id) {
    return await api.get(`/notifications/${id}`);
  },
};

export default notificationService;
