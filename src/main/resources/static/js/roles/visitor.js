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
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Permits</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--warning);">
                <div class="stat-value text-muted" style="color: var(--warning);">${stats.pending}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--success);">
                <div class="stat-value text-success" style="color: var(--success);">${stats.approved}</div>
                <div class="stat-label">Approved</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--info);">
                <div class="stat-value text-info" style="color: var(--info);">${stats.active}</div>
                <div class="stat-label">Active Now</div>
            </div>
        `;
    },

    async loadPermits() {
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

        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';

        try {
            const permits = await Permits.getByVisitor(this.user.id);
            if (!permits || permits.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No permits found.</td></tr>';
                return;
            }

            const sorted = permits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tbody.innerHTML = sorted.map(p => `
                <tr>
                    <td class="font-bold">${p.permitNumber}</td>
                    <td>${p.visitPurpose}</td>
                    <td class="text-sm">
                        <div>Start: ${UI.formatDate(p.scheduledStartTime)}</div>
                        <div class="text-muted">End: ${UI.formatDate(p.scheduledEndTime)}</div>
                    </td>
                    <td><span class="badge ${UI.getStatusBadge(p.status)}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline text-xs" onclick="VisitorDashboard.viewDetails(${p.id})">Details</button>
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
