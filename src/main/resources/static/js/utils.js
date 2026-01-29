// UI Utility Functions
const UI = {
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        document.body.insertBefore(alertDiv, document.body.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },

    showLoading(show = true) {
        let spinner = document.getElementById('loading-spinner');
        if (show) {
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.id = 'loading-spinner';
                spinner.className = 'spinner';
                document.body.appendChild(spinner);
            }
        } else {
            if (spinner) {
                spinner.remove();
            }
        }
    },

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getStatusBadge(status) {
        const badges = {
            'DRAFT': 'badge-info',
            'PENDING_PIC': 'badge-warning',
            'PENDING_MANAGER': 'badge-warning',
            'APPROVED': 'badge-success',
            'REJECTED': 'badge-danger',
            'ACTIVE': 'badge-success',
            'COMPLETED': 'badge-info',
            'CANCELLED': 'badge-danger',
            'EXPIRED': 'badge-danger'
        };
        return badges[status] || 'badge-info';
    },

    // Get specific badge class for Access Logs
    getLogStatusBadge(status) {
        return status === 'GRANTED' ? 'badge-success' : 'badge-danger';
    }
};
