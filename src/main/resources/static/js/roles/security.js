const SecurityDashboard = {
    async init(user) {
        console.log('Initializing Security Dashboard');
        this.user = user;
        document.getElementById('btn-logs').style.display = 'inline-block';

        await this.loadStats();
        await this.loadAllPermits();
    },

    async loadStats() {
        // Calculate stats from all permits for now
        const permits = await Permits.getAll();
        const active = permits.filter(p => p.status === 'ACTIVE').length;
        const approved = permits.filter(p => p.status === 'APPROVED').length;
        const today = permits.filter(p => new Date(p.scheduledStartTime).toDateString() === new Date().toDateString()).length;

        document.getElementById('stats-container').innerHTML = `
             <div class="stat-card" style="border-left: 4px solid var(--info);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Active Inside</div>
                    <i class="ri-run-line text-info" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-info">${active}</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--success);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Expected Today</div>
                    <i class="ri-calendar-check-line text-success" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-success">${today}</div>
            </div>
            <div class="stat-card">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Approved (Total)</div>
                    <i class="ri-checkbox-circle-line text-muted" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value">${approved}</div>
            </div>
        `;
    },

    async loadAllPermits() {
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-head');

        thead.innerHTML = `
            <tr>
                <th>Permit #</th>
                <th>Visitor</th>
                <th>PIC</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;

        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4"><div class="d-flex justify-center items-center gap-2 text-muted"><i class="ri-loader-4-line ri-spin"></i> Loading application data...</div></td></tr>';

        try {
            // Ideally we filter backend side, but for now getAll
            const permits = await Permits.getAll();
            // Filter mostly for relevant statuses for security
            const relevant = permits.filter(p => ['APPROVED', 'ACTIVE', 'COMPLETED', 'CHECKED_OUT'].includes(p.status));

            if (!relevant || relevant.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-muted">No relevant permits found.</td></tr>';
                return;
            }

            const sorted = relevant.sort((a, b) => new Date(b.scheduledStartTime) - new Date(a.scheduledStartTime));

            tbody.innerHTML = sorted.map(p => `
                <tr>
                    <td class="font-bold text-primary">${p.permitNumber}</td>
                    <td>
                        <div class="font-medium">${p.visitor.fullName}</div>
                        <small class="text-muted"><i class="ri-building-line text-xs"></i> ${p.visitor.company || 'Visitor'}</small>
                    </td>
                    <td>${p.pic ? p.pic.fullName : '<span class="text-muted">-</span>'}</td>
                    <td>
                         <div class="d-flex items-center gap-2"><i class="ri-calendar-event-line text-muted"></i> ${UI.formatDate(p.scheduledStartTime)}</div>
                    </td>
                    <td><span class="badge ${UI.getStatusBadge(p.status)}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline text-xs" onclick="viewPermit(${p.id})">
                            <i class="ri-share-forward-line"></i> Process
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${e.message}</td></tr>`;
        }
    }
};
