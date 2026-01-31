import api from './api';

// Approval Service
export const approvalService = {
  async picReview(approvalData, picId) {
    return await api.post(`/approvals/pic/review?picId=${picId}`, approvalData);
  },

  async managerApprove(approvalData, managerId) {
    return await api.post(`/approvals/manager/approve?managerId=${managerId}`, approvalData);
  },

  async getPICPending(picId) {
    return await api.get(`/approvals/pic/${picId}/pending`);
  },

  async getManagerPending(managerId) {
    return await api.get(`/approvals/manager/${managerId}/pending`);
  },

  async getByPermit(permitId) {
    return await api.get(`/approvals/permit/${permitId}`);
  },
  
  async getHistory(userId) {
    return await api.get(`/approvals/history/${userId}`);
  },
  
  async getAllByUser(userId) {
    return await api.get(`/approvals/user/${userId}/all`);
  },
};

export default approvalService;
