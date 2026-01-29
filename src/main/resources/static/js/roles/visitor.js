const VisitorDashboard = {
    async init(user) {
        console.log('Initializing Visitor Dashboard');
        this.user = user;

        // Hide irrelevant tabs
        document.getElementById('btn-approvals').style.display = 'none';
        document.getElementById('btn-logs').style.display = 'none';

        // Set 'My Permits' as active tab visually
        document.querySelectorAll('#tab-buttons button').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        const myPermitsBtn = document.querySelector('button[onclick="switchTab(\'permits\')"]');
        if (myPermitsBtn) {
            myPermitsBtn.classList.remove('btn-secondary');
            myPermitsBtn.classList.add('btn-primary');
        }

        await this.loadStats();
        await this.loadPermits();
    },

    async loadStats() {
        const permits = await Permits.getByVisitor(this.user.id);
        const stats = {
            total: permits.length,
            pending: permits.filter(p => p.status.includes('PENDING')).length,
            approved: permits.filter(p => p.status === 'APPROVED').length,
            active: permits.filter(p => p.status === 'ACTIVE').length
        };

        this.renderStats(stats);
    },

    renderStats(stats) {
        const container = document.getElementById('stats-container');
        container.innerHTML = `
            <div class="stat-card">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Total Permits</div>
                    <i class="ri-article-line text-muted" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--warning);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Pending</div>
                    <i class="ri-time-line text-warning" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-muted" style="color: var(--warning);">${stats.pending}</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--success);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Approved</div>
                    <i class="ri-check-double-line text-success" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-success" style="color: var(--success);">${stats.approved}</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--info);">
               <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Active Now</div>
                    <i class="ri-run-line text-info" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-info" style="color: var(--info);">${stats.active}</div>
            </div>
        `;
    },

    async loadPermits() {
        // ... (headers setup)
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-head');

        thead.innerHTML = `
            <tr>
                <th>Permit #</th>
                <th>Purpose</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;

        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4"><div class="d-flex justify-center items-center gap-2 text-muted"><i class="ri-loader-4-line ri-spin"></i> Loading...</div></td></tr>';

        try {
            const permits = await Permits.getByVisitor(this.user.id);
            if (!permits || permits.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-muted">No permits found.</td></tr>';
                return;
            }

            const sorted = permits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tbody.innerHTML = sorted.map(p => `
                <tr>
                    <td class="font-bold text-primary">${p.permitNumber}</td>
                    <td>${p.visitPurpose}</td>
                    <td class="text-sm">
                        <div class="d-flex items-center gap-2"><i class="ri-calendar-event-line text-muted"></i> ${UI.formatDate(p.scheduledStartTime)}</div>
                        <div class="text-muted d-flex items-center gap-2" style="margin-top:0.25rem;"><i class="ri-arrow-right-line"></i> ${UI.formatDate(p.scheduledEndTime)}</div>
                    </td>
                    <td><span class="badge ${UI.getStatusBadge(p.status)}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline text-xs" onclick="VisitorDashboard.viewDetails(${p.id})">
                            <i class="ri-eye-line"></i> Details
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${e.message}</td></tr>`;
        }
    },

    async viewDetails(id) {
        // Reuse global viewPermit or implement specific
        viewPermit(id);
    }
};
