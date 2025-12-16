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
                <div class="stat-value" style="color: var(--warning);">${stats['Pending Approval']}</div>
                <div class="stat-label">Pending Approval</div>
            </div>
        `;
    },

    async loadApprovals() {
        // ... Similar implementation to PIC ...
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-head');
        thead.innerHTML = `<tr><th>Permit #</th><th>Requester</th><th>Purpose</th><th>Status</th><th>Action</th></tr>`;

        const approvals = await Approvals.getManagerPending(this.user.id);
        // Render...
        tbody.innerHTML = approvals.map(app => {
            const p = app.workingPermit;
            return `
            <tr>
                <td class="font-bold">${p.permitNumber}</td>
                <td>${p.visitor.fullName}</td>
                <td>${p.visitPurpose}</td>
                <td><span class="badge badge-warning">PENDING APPROVAL</span></td>
                <td><button class="btn btn-sm btn-primary" onclick="viewPermit(${p.id}, true)">Approve</button></td>
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
