const PICDashboard = {
    async init(user) {
        console.log('Initializing PIC Dashboard');
        this.user = user;

        // Setup UI for PIC
        document.getElementById('btn-approvals').style.display = 'inline-block';
        document.getElementById('btn-approvals').classList.remove('btn-secondary');
        document.getElementById('btn-approvals').classList.add('btn-primary');

        document.getElementById('btn-logs').style.display = 'none';

        // Switch to "My Permits" button style to secondary since Approvals is main
        const myPermitsBtn = document.querySelector('button[onclick="switchTab(\'permits\')"]');
        if (myPermitsBtn) {
            myPermitsBtn.classList.remove('btn-primary');
            myPermitsBtn.classList.add('btn-secondary');
        }

        // Set initial active tab
        this.currentTab = 'approvals';

        // Override switchTab global function logic or listen to clicks
        // For simplicity, we just load stats and approvals first
        await this.loadStats();
        await this.loadApprovals();
    },

    async loadStats() {
        try {
            // Get Pending Approvals
            const pendingApprovals = await Approvals.getPICPending(this.user.id);
            // Get "My Permits" (requested by PIC themselves)
            const myPermits = await Permits.getByVisitor(this.user.id);

            const stats = {
                'Pending Review': pendingApprovals.length,
                'My Requests': myPermits.length
            };

            this.renderStats(stats);
        } catch (e) {
            console.error("Failed to load PIC stats", e);
        }
    },

    renderStats(stats) {
        const container = document.getElementById('stats-container');
        container.innerHTML = `
            <div class="stat-card" style="border-left: 4px solid var(--warning);">
                <div class="stat-value" style="color: var(--warning);">${stats['Pending Review']}</div>
                <div class="stat-label">Pending Review</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--primary);">
                <div class="stat-value text-primary">${stats['My Requests']}</div>
                <div class="stat-label">My Permit Requests</div>
            </div>
        `;
    },

    async loadApprovals() {
        const tbody = document.getElementById('table-body');
        const thead = document.getElementById('table-head');

        thead.innerHTML = `
            <tr>
                <th>Permit #</th>
                <th>Requester</th>
                <th>Purpose</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;

        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading approvals...</td></tr>';

        try {
            const approvals = await Approvals.getPICPending(this.user.id);

            if (!approvals || approvals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No pending approvals.</td></tr>';
                return;
            }

            const sorted = approvals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tbody.innerHTML = sorted.map(app => {
                const p = app.workingPermit;
                return `
                <tr>
                    <td class="font-bold">${p.permitNumber}</td>
                    <td>
                        <div>${p.visitor.fullName}</div>
                        <small class="text-muted">${p.visitor.company || 'External'}</small>
                    </td>
                    <td>${p.visitPurpose}</td>
                    <td>${UI.formatDate(app.createdAt)}</td>
                    <td><span class="badge badge-warning">PENDING REVIEW</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary text-xs" onclick="PICDashboard.reviewPermit(${p.id})">Review</button>
                    </td>
                </tr>
            `}).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${e.message}</td></tr>`;
        }
    },

    async loadMyPermits() {
        // Use Visitor logic for "My Permits" list
        VisitorDashboard.user = this.user;
        await VisitorDashboard.loadPermits();
    },

    async reviewPermit(permitId) {
        viewPermit(permitId, true); // Open modal with approval actions
    },

    // Action handlers called from the modal
    async approve(permitId) {
        const comments = prompt("Enter approval comments (optional):", "Approved");
        if (comments === null) return;

        try {
            await Approvals.picReview({
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
            await Approvals.picReview({
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
