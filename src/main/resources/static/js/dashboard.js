// Auth Check
Auth.checkAuth();
const user = Auth.getUser();

// UI Initialization
document.getElementById('user-name').textContent = user.fullName;
document.getElementById('user-role').textContent = user.role;

// Global tab switching handler needed for buttons
window.switchTab = async function (tab) {
    if (user.role === 'PIC') {
        if (tab === 'permits') PICDashboard.loadMyPermits();
        else if (tab === 'approvals') PICDashboard.loadApprovals();
    } else if (user.role === 'VISITOR') {
        VisitorDashboard.loadPermits();
    }
    // Add others...

    // UI Updates
    document.querySelectorAll('#tab-buttons button').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    const activeBtn = Array.from(document.querySelectorAll('#tab-buttons button'))
        .find(b => b.textContent.toLowerCase().includes(tab));
    if (activeBtn) {
        activeBtn.classList.remove('btn-secondary');
        activeBtn.classList.add('btn-primary');
    }
};

// Global Action Handlers (called from Modals)
window.approvePermitAction = async function (id) {
    if (user.role === 'PIC') {
        await PICDashboard.approve(id);
    } else if (user.role === 'MANAGER') {
        await ManagerDashboard.approve(id);
    }
};

window.rejectPermitAction = async function (id) {
    if (user.role === 'PIC') {
        await PICDashboard.reject(id);
    }
    // ...
};

// Main Router
async function loadRoleDashboard() {
    switch (user.role) {
        case 'VISITOR':
            await VisitorDashboard.init(user);
            break;
        case 'PIC':
            await PICDashboard.init(user);
            break;
        case 'MANAGER':
            await ManagerDashboard.init(user);
            break;
        case 'SECURITY':
            await SecurityDashboard.init(user);
            break;
        case 'ADMIN':
            // Admin can see everything, maybe default to Security view + extra
            await SecurityDashboard.init(user);
            break;
        default:
            console.error('Unknown role:', user.role);
    }
}

// Start
loadRoleDashboard();
loadNotifications();


// --- Keep Shared Modal Functions ---
// Notification Logic
async function loadNotifications() {
    try {
        const notifs = await Notifications.getUnread(user.id);
        const badge = document.getElementById('notif-badge');
        if (notifs.length > 0) {
            badge.style.display = 'block';
            badge.textContent = notifs.length;
        } else {
            badge.style.display = 'none';
        }

        const list = document.getElementById('notif-list');
        if (notifs.length === 0) {
            list.innerHTML = '<div class="text-center text-muted text-xs p-2">No new notifications</div>';
        } else {
            list.innerHTML = notifs.map(n => `
                <div class="mb-2 p-2" style="background:var(--bg-body); border-radius:4px; font-size:0.85rem;">
                    <strong>${n.title}</strong><br>
                    ${n.message}<br>
                    <small class="text-muted">${UI.formatDate(n.timestamp)}</small>
                </div>
            `).join('');
        }
    } catch (e) { console.error('Notif error', e); }
}

function toggleNotifications() {
    const drop = document.getElementById('notif-dropdown');
    drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
}

async function markAllRead() {
    await Notifications.markAllAsRead(user.id);
    loadNotifications();
}

// Permit Detail Logic (Shared)
async function viewPermit(id, isApproval = false) {
    try {
        const permit = await Permits.getById(id);
        const content = document.getElementById('detail-content');

        const qrSection = permit.qrCodeData && permit.status === 'APPROVED' ? `
            <div class="text-center mb-4 p-4 bg-gray-50 border rounded">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(permit.qrCodeData)}" alt="QR Code">
                <div class="mt-2 text-primary font-bold">${permit.otpCode || '****'}</div>
                <div class="text-xs text-muted">Show this QR to Security</div>
                <button class="btn btn-sm btn-outline mt-2" onclick="regenerateOTP(${id})">Regenerate OTP</button>
            </div>
        ` : '';

        let actions = '';
        if (isApproval) {
            actions = `
                <div class="d-flex gap-2 mt-4 pt-4 border-t">
                    <button class="btn btn-success flex-1" onclick="approvePermitAction(${id})">Approve</button>
                    <button class="btn btn-danger flex-1" onclick="rejectPermitAction(${id})">Reject</button>
                </div>
             `;
        } else {
            if (permit.status === 'PENDING_PIC' || permit.status === 'PENDING_MANAGER' || permit.status === 'APPROVED') {
                actions = `
                    <div class="mt-4 pt-4 border-t text-right">
                        <button class="btn btn-danger btn-sm" onclick="cancelPermitAction(${id})">Cancel Permit</button>
                    </div>
                `;
            }
        }

        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    ${qrSection}
                    <div class="mb-2"><strong>Permit #:</strong> ${permit.permitNumber}</div>
                    <div class="mb-2"><strong>Status:</strong> <span class="badge ${UI.getStatusBadge(permit.status)}">${permit.status}</span></div>
                    <div class="mb-2"><strong>Purpose:</strong> ${permit.visitPurpose}</div>
                </div>
                <div>
                    <div class="mb-2"><strong>Location:</strong> ${permit.dataCenter}</div>
                    <div class="mb-2"><strong>Start:</strong> ${UI.formatDate(permit.scheduledStartTime)}</div>
                    <div class="mb-2"><strong>End:</strong> ${UI.formatDate(permit.scheduledEndTime)}</div>
                    <div class="mb-2"><strong>Equipment:</strong><br>${permit.equipmentList ? permit.equipmentList.join(', ') : '-'}</div>
                </div>
            </div>
            ${actions}
        `;

        document.getElementById('detail-modal').classList.add('show');
    } catch (e) {
        alert('Failed to load details: ' + e.message);
    }
}

async function cancelPermitAction(id) {
    if (confirm('Are you sure you want to cancel this permit?')) {
        try {
            await Permits.cancel(id);
            document.getElementById('detail-modal').classList.remove('show');
            // Reload current view
            if (user.role === 'VISITOR') VisitorDashboard.loadPermits();
            alert('Permit cancelled successfully.');
        } catch (e) { alert(e.message); }
    }
}

async function regenerateOTP(id) {
    try {
        const res = await Permits.regenerateOTP(id);
        alert('New OTP: ' + res.otp);
        viewPermit(id); // Reload
    } catch (e) { alert(e.message); }
}

// Modal Functions
function openCreateModal() {
    document.getElementById('create-modal').classList.add('show');

    // Set min date to now
    const now = new Date();
    // Reduce precision to minutes (remove seconds/ms) for datetime-local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);
    document.getElementById('startTime').min = minDateTime;
    document.getElementById('endTime').min = minDateTime;

    loadPICs();
}

function closeCreateModal() { document.getElementById('create-modal').classList.remove('show'); }

function openProfileModal() {
    document.getElementById('profile-username').value = user.username;
    document.getElementById('profile-fullname').value = user.fullName;
    document.getElementById('profile-modal').classList.add('show');
}

async function loadPICs() {
    const select = document.getElementById('picSelect');
    if (select.options.length > 1) return; // Already loaded

    try {
        const pics = await Users.getByRole('PIC');
        select.innerHTML = '<option value="">Select PIC...</option>' +
            pics.map(p => `<option value="${p.id}">${p.fullName} (${p.company || 'Internal'})</option>`).join('');
    } catch (e) {
        console.error("Failed to load PICs", e);
        select.innerHTML = '<option value="">Error loading PICs</option>';
    }
}

// Create Permit Submit
document.getElementById('create-permit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<span class="spinner" style="width:1rem;height:1rem;border-width:2px;margin:0"></span> Sending...';
    btn.disabled = true;

    const permitData = {
        visitPurpose: document.getElementById('visitPurpose').value,
        visitType: document.getElementById('visitType').value,
        dataCenter: document.getElementById('dataCenter').value,
        picId: document.getElementById('picSelect').value,
        scheduledStartTime: document.getElementById('startTime').value,
        scheduledEndTime: document.getElementById('endTime').value,
        equipmentList: document.getElementById('equipmentList').value.split('\n').filter(item => item.trim() !== '')
    };

    try {
        await Permits.create(permitData, user.id);
        closeCreateModal();
        e.target.reset();

        // Refresh dashboard
        if (user.role === 'VISITOR') VisitorDashboard.loadPermits();
        else if (user.role === 'PIC') PICDashboard.loadMyPermits();

        alert('Permit request submitted successfully!');
    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerHTML = 'Submit Request';
        btn.disabled = false;
    }
});
