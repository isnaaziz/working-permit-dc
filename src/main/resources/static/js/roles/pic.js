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
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">Pending Review</div>
                    <i class="ri-search-eye-line text-warning" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value" style="color: var(--warning);">${stats['Pending Review']}</div>
            </div>
            <div class="stat-card" style="border-left: 4px solid var(--primary);">
                <div class="d-flex justify-between items-center mb-2">
                    <div class="stat-label">My Requests</div>
                    <i class="ri-file-user-line text-primary" style="font-size: 1.5rem;"></i>
                </div>
                <div class="stat-value text-primary">${stats['My Requests']}</div>
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

        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4"><div class="d-flex justify-center items-center gap-2 text-muted"><i class="ri-loader-4-line ri-spin"></i> Loading approvals...</div></td></tr>';

        try {
            const approvals = await Approvals.getPICPending(this.user.id);

            if (!approvals || approvals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-muted">No pending approvals.</td></tr>';
                return;
            }

            const sorted = approvals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tbody.innerHTML = sorted.map(app => {
                const p = app.workingPermit;
                return `
                <tr>
                    <td class="font-bold text-primary">${p.permitNumber}</td>
                    <td>
                        <div class="font-medium">${p.visitor.fullName}</div>
                        <small class="text-muted"><i class="ri-building-line text-xs"></i> ${p.visitor.company || 'External'}</small>
                    </td>
                    <td>${p.visitPurpose}</td>
                    <td>
                         <div class="d-flex items-center gap-2"><i class="ri-time-line text-muted"></i> ${UI.formatDate(app.createdAt)}</div>
                    </td>
                    <td><span class="badge badge-warning">PENDING REVIEW</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary text-xs" onclick="PICDashboard.reviewPermit(${p.id})">
                             <i class="ri-edit-circle-line"></i> Review
                        </button>
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
