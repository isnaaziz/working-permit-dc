import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';

// Dashboard untuk Admin - full control dan monitoring
const AdminDashboard = ({ user, stats, permits, loading, formatDate, getStatusBadge }) => {
  // Calculate comprehensive stats
  const todayStats = {
    checkIns: permits.filter(p => {
      if (!p.actualCheckInTime) return false;
      const today = new Date().toDateString();
      return new Date(p.actualCheckInTime).toDateString() === today;
    }).length,
    checkOuts: permits.filter(p => {
      if (!p.actualCheckOutTime) return false;
      const today = new Date().toDateString();
      return new Date(p.actualCheckOutTime).toDateString() === today;
    }).length,
    newPermits: permits.filter(p => {
      const today = new Date().toDateString();
      return new Date(p.createdAt).toDateString() === today;
    }).length,
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch(user?.role) {
      case 'ADMINISTRATOR_ODC': return 'Administrator Tim ODC';
      case 'ADMINISTRATOR_INFRA': return 'Administrator Tim INFRA';
      case 'ADMINISTRATOR_NETWORK': return 'Administrator Tim Network';
      case 'ADMIN': return 'System Administrator';
      default: return 'Administrator';
    }
  };

  // Get team color
  const getTeamColor = () => {
    switch(user?.team) {
      case 'TIM_ODC': return 'from-blue-500 to-cyan-500';
      case 'TIM_INFRA': return 'from-green-500 to-emerald-500';
      case 'TIM_NETWORK': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-primary">Dashboard {getRoleDisplayName()}</h1>
          </div>
          <p className="text-text-muted">Panel kontrol penuh untuk manajemen Data Center.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/users">
            <Button icon={<i className="ri-user-settings-line"></i>} variant="outline">
              Kelola Users
            </Button>
          </Link>
          <Link to="/dashboard/settings">
            <Button icon={<i className="ri-settings-3-line"></i>}>
              Pengaturan
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Banner */}
      <Card className="bg-linear-to-r from-primary to-accent text-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <i className="ri-shield-user-line text-3xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-xl">{user?.fullName}</h2>
            <p className="opacity-90">{getRoleDisplayName()}</p>
            {user?.team && (
              <Badge className="mt-2 bg-white/20 text-white">
                {user.team === 'TIM_ODC' ? 'Tim ODC' : 
                 user.team === 'TIM_INFRA' ? 'Tim INFRA' : 
                 user.team === 'TIM_NETWORK' ? 'Tim Network' : user.team}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-info-bg text-info mb-2">
              <i className="ri-file-list-3-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Total Permit</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-warning-bg text-warning mb-2">
              <i className="ri-time-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.pending}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Pending</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-success-bg text-success mb-2">
              <i className="ri-user-follow-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Aktif</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-danger-bg text-danger mb-2">
              <i className="ri-close-circle-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.rejected}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Ditolak</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-body text-accent mb-2">
              <i className="ri-login-box-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{todayStats.checkIns}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Check-in Hari Ini</p>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl bg-info-bg text-info mb-2">
              <i className="ri-add-circle-line text-3xl"></i>
            </div>
            <p className="text-2xl font-bold text-primary">{todayStats.newPermits}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Permit Baru Hari Ini</p>
          </div>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/permits">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-file-list-3-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Semua Permit</span>
          </Card>
        </Link>
        <Link to="/dashboard/approvals">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-check-double-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Approvals</span>
          </Card>
        </Link>
        <Link to="/dashboard/access">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-qr-scan-2-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Access Control</span>
          </Card>
        </Link>
        <Link to="/dashboard/logs">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-history-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Access Logs</span>
          </Card>
        </Link>
        <Link to="/dashboard/mutasi-barang/list">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-exchange-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Mutasi Barang</span>
          </Card>
        </Link>
        <Link to="/dashboard/reports">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-bar-chart-box-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Laporan</span>
          </Card>
        </Link>
        <Link to="/dashboard/users">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-group-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Manajemen User</span>
          </Card>
        </Link>
        <Link to="/dashboard/settings">
          <Card hover className="text-center py-6 group">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-settings-3-line text-2xl"></i>
            </div>
            <span className="font-medium text-dark-600">Pengaturan</span>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-primary">
            <i className="ri-list-check text-accent mr-2"></i>
            Aktivitas Terbaru
          </h3>
          <Link to="/dashboard/permits">
            <Button variant="ghost" size="sm">Lihat Semua</Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Permit</th>
                  <th className="px-4 py-3 text-left">Visitor</th>
                  <th className="px-4 py-3 text-left">PIC</th>
                  <th className="px-4 py-3 text-left">Data Center</th>
                  <th className="px-4 py-3 text-left">Jadwal</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permits.slice(0, 10).map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-600">{permit.permitNumber}</td>
                    <td className="px-4 py-3">{permit.visitor?.fullName}</td>
                    <td className="px-4 py-3">{permit.pic?.fullName}</td>
                    <td className="px-4 py-3">{permit.dataCenter}</td>
                    <td className="px-4 py-3">{formatDate(permit.scheduledStartTime)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(permit.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/dashboard/permits/${permit.id}`}>
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <i className="ri-eye-line"></i>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
