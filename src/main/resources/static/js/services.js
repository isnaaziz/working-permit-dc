// Permit Functions
const Permits = {
    async create(permitData, visitorId) {
        return await API.post(`/permits?visitorId=${visitorId}`, permitData);
    },

    async getById(id) {
        return await API.get(`/permits/${id}`);
    },

    async getByNumber(permitNumber) {
        return await API.get(`/permits/number/${permitNumber}`);
    },

    async getByVisitor(visitorId) {
        return await API.get(`/permits/visitor/${visitorId}`);
    },

    async getByPIC(picId) {
        return await API.get(`/permits/pic/${picId}`);
    },

    async getByStatus(status) {
        return await API.get(`/permits/status/${status}`);
    },

    async getAll() {
        return await API.get('/permits');
    },

    async update(id, permitData) {
        return await API.put(`/permits/${id}`, permitData);
    },

    async cancel(id) {
        return await API.post(`/permits/${id}/cancel`, {});
    },

    async activate(id) {
        return await API.post(`/permits/${id}/activate`, {});
    },

    async regenerateOTP(id) {
        return await API.post(`/permits/${id}/regenerate-otp`, {});
    }
};

// Approval Functions
const Approvals = {
    async picReview(approvalData, picId) {
        return await API.post(`/approvals/pic/review?picId=${picId}`, approvalData);
    },

    async managerApprove(approvalData, managerId) {
        return await API.post(`/approvals/manager/approve?managerId=${managerId}`, approvalData);
    },

    async getPICPending(picId) {
        return await API.get(`/approvals/pic/${picId}/pending`);
    },

    async getManagerPending(managerId) {
        return await API.get(`/approvals/manager/${managerId}/pending`);
    },

    async getByPermit(permitId) {
        return await API.get(`/approvals/permit/${permitId}`);
    }
};

// Access Control Functions
const Access = {
    async verify(qrCodeData, otpCode) {
        return await API.post('/access/verify', { qrCodeData, otpCode });
    },

    async checkIn(checkInData) {
        return await API.post('/access/check-in', checkInData);
    },

    async checkOut(permitId) {
        return await API.post(`/access/check-out?permitId=${permitId}`, {});
    },

    async getLogs() {
        return await API.get('/access/logs');
    },

    async getPermitLogs(permitId) {
        return await API.get(`/access/logs/permit/${permitId}`);
    }
};

// Notification Functions
const Notifications = {
    async getUserNotifications(userId) {
        return await API.get(`/notifications/user/${userId}`);
    },

    async getUnread(userId) {
        return await API.get(`/notifications/user/${userId}/unread`);
    },

    async markAsRead(id) {
        return await API.post(`/notifications/${id}/read`, {});
    },

    async markAllAsRead(userId) {
        return await API.post(`/notifications/user/${userId}/read-all`, {});
    }
};

// User Functions
const Users = {
    async getById(id) {
        return await API.get(`/users/${id}`);
    },

    async getByRole(role) {
        return await API.get(`/users/role/${role}`);
    },

    async getAll() {
        return await API.get('/users');
    }
};
