import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { permitService } from '../../services/permitService';

// Dashboard untuk Manager - fokus pada approval dan overview
const ManagerDashboard = ({ user, stats, permits, loading, formatDate, getStatusBadge }) => {
  // Filter permits yang pending Manager approval
  const pendingApproval = permits.filter(p => p.status === 'PENDING_MANAGER');
  const todayPermits = permits.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.scheduledStartTime).toDateString() === today;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard Manager</h1>
          <p className="text-text-muted">Approval working permit dan monitoring Data Center.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/approvals">
            <Button icon={<i className="ri-check-double-line"></i>}>
              Approval ({pendingApproval.length})
            </Button>
          </Link>
          <Link to="/dashboard/logs">
            <Button icon={<i className="ri-history-line"></i>} variant="outline">
              Access Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-danger-bg text-danger inline-flex mb-2">
              <i className="ri-alarm-warning-line text-3xl"></i>
            </div>
            <p className="text-3xl font-bold text-primary">{pendingApproval.length}</p>
            <p className="text-sm text-text-muted">Perlu Approval</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-info-bg text-info inline-flex mb-2">
              <i className="ri-file-list-3-line text-3xl"></i>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-text-muted">Total Permit</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-success-bg text-success inline-flex mb-2">
              <i className="ri-user-follow-line text-3xl"></i>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.active}</p>
            <p className="text-sm text-text-muted">Visitor Aktif</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-body text-accent inline-flex mb-2">
              <i className="ri-calendar-todo-line text-3xl"></i>
            </div>
            <p className="text-3xl font-bold text-primary">{todayPermits.length}</p>
            <p className="text-sm text-text-muted">Jadwal Hari Ini</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-warning-bg text-warning inline-flex mb-2">
              <i className="ri-time-line text-3xl"></i>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.pending}</p>
            <p className="text-sm text-text-muted">Dalam Proses</p>
          </div>
        </Card>
      </div>

      {/* Urgent Approvals Alert */}
      {pendingApproval.length > 0 && (
        <Card className="border-l-4 border-l-danger bg-danger-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                <i className="ri-notification-badge-line text-danger text-2xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-primary">{pendingApproval.length} Permit Menunggu Approval Anda</h3>
                <p className="text-text-muted text-sm">Permit telah di-review oleh PIC dan siap untuk approval final.</p>
              </div>
            </div>
            <Link to="/dashboard/approvals">
              <Button className="btn btn-danger">Approve Sekarang</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              <i className="ri-checkbox-circle-line text-accent mr-2"></i>
              Pending Approvals
            </h3>
            <Link to="/dashboard/approvals">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
            </div>
          ) : pendingApproval.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-checkbox-circle-line text-4xl text-green-400 mb-2"></i>
              <p className="text-gray-500">Semua permit sudah diproses</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Permit</th>
                    <th className="px-4 py-3 text-left">Visitor</th>
                    <th className="px-4 py-3 text-left">PIC</th>
                    <th className="px-4 py-3 text-left">Tujuan</th>
                    <th className="px-4 py-3 text-left">Dokumen</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingApproval.slice(0, 5).map((permit) => (
                    <tr key={permit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-primary-600">{permit.permitNumber}</td>
                      <td className="px-4 py-3">{permit.visitor?.fullName}</td>
                      <td className="px-4 py-3">{permit.pic?.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{permit.visitPurpose?.substring(0, 30)}...</td>
                      <td className="px-4 py-3">
                        {permit.workOrderDocument ? (
                          <button
                            onClick={async () => {
                              try {
                                const blob = await permitService.viewDocument(permit.id);
                                const url = window.URL.createObjectURL(blob);
                                window.open(url, '_blank');
                              } catch (e) {
                                alert('Failed to view document');
                              }
                            }}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Document"
                          >
                            <i className="ri-file-text-line text-xl"></i>
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/dashboard/permits/${permit.id}`}>
                          <Button size="sm">Review</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Stats Panel */}
        <Card>
          <h3 className="font-bold text-lg text-primary mb-4">
            <i className="ri-pie-chart-line text-accent mr-2"></i>
            Statistik Permit
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Disetujui</span>
              </div>
              <span className="font-bold text-green-600">{permits.filter(p => p.status === 'APPROVED' || p.status === 'ACTIVE').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Pending PIC</span>
              </div>
              <span className="font-bold text-amber-600">{permits.filter(p => p.status === 'PENDING_PIC').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Pending Manager</span>
              </div>
              <span className="font-bold text-blue-600">{permits.filter(p => p.status === 'PENDING_MANAGER').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Ditolak</span>
              </div>
              <span className="font-bold text-red-600">{stats.rejected}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm">Selesai</span>
              </div>
              <span className="font-bold text-gray-600">{permits.filter(p => p.status === 'COMPLETED').length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
