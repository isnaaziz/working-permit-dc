const ManagerDashboard = {
    async init(user) {
        console.log('Initializing Manager Dashboard');
        this.user = user;

        document.getElementById('btn-approvals').style.display = 'inline-block';
        document.getElementById('btn-approvals').classList.remove('btn-secondary');
        document.getElementById('btn-approvals').classList.add('btn-primary');

        this.currentTab = 'approvals';
        await this.loadStats();
        await this.loadApprovals();
    },

    async loadStats() {
        const pending = await Approvals.getManagerPending(this.user.id);
        const stats = { 'Pending Approval': pending.length };

        document.getElementById('stats-container').innerHTML = `
            <div class="stat-card" style="border-left: 4px solid var(--warning);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Pending Approval</div>
                    <i class="ri-shield-user-line text-warning" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value" style="color: var(--warning);">${stats['Pending Approval']}</div>
            </div>
        `;
    },

    async loadApprovals() {
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-head');
        thead.innerHTML = `<tr><th>Permit #</th><th>Requester</th><th>Purpose</th><th>Status</th><th>Action</th></tr>`;

        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4"><div class="d-flex justify-center items-center gap-2 text-muted"><i class="ri-loader-4-line ri-spin"></i> Loading...</div></td></tr>';

        const approvals = await Approvals.getManagerPending(this.user.id);

        if (!approvals || approvals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-muted">No pending approvals.</td></tr>';
            return;
        }

        tbody.innerHTML = approvals.map(app => {
            const p = app.workingPermit;
            return `
            <tr>
                <td class="font-bold text-primary">${p.permitNumber}</td>
                <td>
                    <div class="font-medium">${p.visitor.fullName}</div>
                    <small class="text-muted"><i class="ri-building-line text-xs"></i> ${p.visitor.company || 'External'}</small>
                </td>
                <td>${p.visitPurpose}</td>
                <td><span class="badge badge-warning">PENDING APPROVAL</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewPermit(${p.id}, true)">
                        <i class="ri-check-line"></i> Verify
                    </button>
                </td>
            </tr>`;
        }).join('');
    },

    // Actions...
    async approve(permitId) {
        const comments = prompt("Enter approval comments (optional):", "Approved");
        if (comments === null) return;

        try {
            await Approvals.managerApprove({
                permitId: permitId,
                approved: true,
                comments: comments
            }, this.user.id);

            document.getElementById('detail-modal').classList.remove('show');
            alert("Permit approved successfully.");
            this.init(this.user); // Refresh
        } catch (e) {
            alert("Approval failed: " + e.message);
        }
    },

    async reject(permitId) {
        const comments = prompt("Enter rejection reason (required):");
        if (!comments) return;

        try {
            await Approvals.managerApprove({
                permitId: permitId,
                approved: false,
                comments: comments
            }, this.user.id);

            document.getElementById('detail-modal').classList.remove('show');
            alert("Permit rejected.");
            this.init(this.user); // Refresh
        } catch (e) {
            alert("Rejection failed: " + e.message);
        }
    }
};
