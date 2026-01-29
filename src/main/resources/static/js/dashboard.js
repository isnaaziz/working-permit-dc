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

        const isSecurity = user.role === 'SECURITY';
        const qrSection = (permit.qrCodeData && permit.status === 'APPROVED' && !isSecurity) ? `
            <div class="text-center mb-4 p-4" style="background:var(--bg-body); border-radius:var(--radius-lg); border:1px solid var(--border);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(permit.qrCodeData)}" alt="QR Code" style="border-radius: var(--radius-md);">
                <div class="mt-2 text-primary font-bold" style="font-size: 1.25rem;">${permit.otpCode || '****'}</div>
                <div class="text-xs text-muted">Show this QR code to Security for entry</div>
                <button class="btn btn-outline btn-sm mt-2" onclick="regenerateOTP(${id})">
                    <i class="ri-refresh-line"></i> Regenerate OTP
                </button>
            </div>
        ` : '';

        let actions = '';
        if (isApproval) {
            actions = `
                <div class="d-flex gap-2 mt-4 pt-4" style="border-top:1px solid var(--divider);">
                    <button class="btn btn-success w-full" onclick="approvePermitAction(${id})">
                        <i class="ri-check-line"></i> Approve Application
                    </button>
                    <button class="btn btn-danger w-full" onclick="rejectPermitAction(${id})">
                        <i class="ri-close-line"></i> Reject
                    </button>
                </div>
             `;
        } else if (user.role === 'SECURITY') {
            if (permit.status === 'APPROVED') {
                actions = `
                    <div class="mt-4 pt-4 text-center" style="border-top:1px solid var(--divider);">
                        <button class="btn btn-success w-full" onclick="checkInAction(${id})">
                            <i class="ri-login-circle-line"></i> Check In Visitor
                        </button>
                    </div>`;
            } else if (['ACTIVE', 'CHECKED_IN'].includes(permit.status)) {
                actions = `
                    <div class="mt-4 pt-4 text-center" style="border-top:1px solid var(--divider);">
                        <button class="btn btn-warning w-full" onclick="checkOutAction(${id})">
                            <i class="ri-logout-circle-line"></i> Check Out Visitor
                        </button>
                    </div>`;
            }
        } else {
            if (permit.status === 'PENDING_PIC' || permit.status === 'PENDING_MANAGER' || permit.status === 'APPROVED') {
                actions = `
                    <div class="mt-4 pt-4 text-right" style="border-top:1px solid var(--divider);">
                        <button class="btn btn-danger btn-sm" onclick="cancelPermitAction(${id})">
                            <i class="ri-stop-circle-line"></i> Cancel Permit
                        </button>
                    </div>
                `;
            }
        }

        content.innerHTML = `
            <div class="d-flex items-center gap-4 mb-4" style="background:var(--bg-body); padding:1rem; border-radius:var(--radius-md);">
               <div style="flex:1;">
                    <div class="text-xs text-muted uppercase tracking-wider mb-1">Permit Number</div>
                    <div class="font-bold text-xl text-primary">${permit.permitNumber}</div>
               </div>
               <div class="text-right">
                    <span class="badge ${UI.getStatusBadge(permit.status)}" style="font-size:0.9rem; padding:0.5em 1em;">${permit.status}</span>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div> <!-- Left Column -->
                    ${qrSection}
                    
                    <div class="form-group mb-4">
                        <label class="text-xs text-muted uppercase tracking-wider block mb-1">Purpose of Visit</label>
                        <div class="text-sm font-medium" style="background:var(--bg-surface); padding:0.75rem; border:1px solid var(--border); border-radius:var(--radius-md);">
                            ${permit.visitPurpose}
                        </div>
                    </div>

                     <div class="form-group mb-4">
                        <label class="text-xs text-muted uppercase tracking-wider block mb-1">Requester Info</label>
                         <div class="d-flex items-center gap-3 p-3" style="background:var(--bg-body); border:1px solid var(--border); border-radius:var(--radius-md);">
                            <div class="user-avatar" style="width:40px; height:40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin: 0; box-shadow:none;">${permit.visitor.fullName.charAt(0)}</div>
                            <div style="flex: 1; min-width: 0;">
                                <div class="font-bold text-sm text-truncate" style="line-height:1.2;">${permit.visitor.fullName}</div>
                                <div class="text-xs text-muted text-truncate" style="line-height:1.2;">${permit.visitor.company || 'External Visitor'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div> <!-- Right Column -->
                    <div class="form-group mb-4">
                        <label class="text-xs text-muted uppercase tracking-wider block mb-1">Location & Time</label>
                        <div style="background:var(--bg-surface); padding:1rem; border:1px solid var(--border); border-radius:var(--radius-md);">
                             <div class="d-flex items-center gap-2 mb-2">
                                <i class="ri-map-pin-line text-primary"></i>
                                <span class="font-bold">${permit.dataCenter}</span>
                            </div>
                            <div style="height:1px; background:var(--divider); margin:0.5rem 0;"></div>
                            <div class="d-flex items-center gap-2 mb-1">
                                <i class="ri-calendar-event-line text-success"></i>
                                <span class="text-sm">Start: ${UI.formatDate(permit.scheduledStartTime)}</span>
                            </div>
                             <div class="d-flex items-center gap-2">
                                <i class="ri-time-line text-danger"></i>
                                <span class="text-sm">End: &nbsp; ${UI.formatDate(permit.scheduledEndTime)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="text-xs text-muted uppercase tracking-wider block mb-1">Equipment</label>
                        <div class="text-sm p-3 border rounded" style="background:var(--bg-surface); min-height:100px;">
                            ${permit.equipmentList && permit.equipmentList.length > 0
                ? `<ul class="list-disc pl-4" style="margin:0;">${permit.equipmentList.map(item => `<li>${item}</li>`).join('')}</ul>`
                : '<div class="text-muted italic d-flex items-center gap-2"><i class="ri-prohibited-line"></i> No equipment declared</div>'}
                        </div>
                    </div>
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

window.checkInAction = async function (id) {
    const otp = prompt("Please enter the visitor's OTP code to verify:");
    if (!otp) return;

    try {
        const permit = await Permits.getById(id);
        await Access.checkIn({ qrCodeData: permit.qrCodeData, otpCode: otp, location: 'Main Gate' });
        document.getElementById('detail-modal').classList.remove('show');

        await SecurityDashboard.loadAllPermits();
        await SecurityDashboard.loadStats();
        alert('Check-in successful!');
    } catch (e) { alert('Check-in failed: ' + e.message); }
};

window.checkOutAction = async function (id) {
    if (!confirm("Confirm Check-out for this visitor?")) return;
    try {
        await Access.checkOut(id);
        document.getElementById('detail-modal').classList.remove('show');

        await SecurityDashboard.loadAllPermits();
        await SecurityDashboard.loadStats();
        alert('Check-out successful!');
    } catch (e) { alert('Check-out failed: ' + e.message); }
};

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
