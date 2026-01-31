import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';

// Dashboard untuk PIC - fokus pada permit yang perlu di-review dan visitor yang mereka handle
const PICDashboard = ({ user, stats, permits, loading, formatDate, getStatusBadge }) => {
  // Filter permits yang pending PIC review
  const pendingReview = permits.filter(p => p.status === 'PENDING_PIC');
  const activeVisitors = permits.filter(p => p.status === 'ACTIVE');
  
  // Get team display name
  const getTeamName = () => {
    switch(user?.team) {
      case 'TIM_ODC': return 'Tim ODC';
      case 'TIM_INFRA': return 'Tim INFRA';
      case 'TIM_NETWORK': return 'Tim Network';
      default: return 'Data Center Staff';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Team Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-primary">Dashboard PIC</h1>
            <Badge variant="primary" dot>{getTeamName()}</Badge>
          </div>
          <p className="text-text-muted">Kelola permit dan visitor yang menjadi tanggung jawab Anda.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/approvals">
            <Button icon={<i className="ri-check-double-line"></i>} variant="outline">
              Lihat Semua Approval
            </Button>
          </Link>
          <Link to="/dashboard/mutasi-barang/list">
            <Button icon={<i className="ri-file-list-2-line"></i>}>
              Mutasi Barang
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats untuk PIC */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Perlu Review</p>
              <p className="text-3xl font-bold text-primary">{pendingReview.length}</p>
              <p className="text-xs text-text-muted">Menunggu review Anda</p>
            </div>
            <div className="p-3 rounded-xl bg-warning-bg text-warning">
              <i className="ri-time-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Visitor Aktif</p>
              <p className="text-3xl font-bold text-primary">{activeVisitors.length}</p>
              <p className="text-xs text-text-muted">Sedang di Data Center</p>
            </div>
            <div className="p-3 rounded-xl bg-success-bg text-success">
              <i className="ri-user-follow-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Total Permit</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-text-muted">Di bawah tanggung jawab Anda</p>
            </div>
            <div className="p-3 rounded-xl bg-info-bg text-info">
              <i className="ri-file-list-3-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Hari Ini</p>
              <p className="text-3xl font-bold text-primary">
                {permits.filter(p => {
                  const today = new Date().toDateString();
                  return new Date(p.scheduledStartTime).toDateString() === today;
                }).length}
              </p>
              <p className="text-xs text-text-muted">Jadwal kunjungan</p>
            </div>
            <div className="p-3 rounded-xl bg-body text-accent">
              <i className="ri-calendar-check-line text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Action Required */}
      {pendingReview.length > 0 && (
        <Card className="bg-linear-to-r from-warning to-warning/80 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <i className="ri-alarm-warning-line text-3xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">Perlu Tindakan Segera!</h3>
                <p className="opacity-90">{pendingReview.length} permit menunggu review dari Anda</p>
              </div>
            </div>
            <Link to="/dashboard/approvals">
              <Button className="bg-white text-warning hover:bg-white/90">
                Review Sekarang
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review List */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              <i className="ri-time-line text-warning mr-2"></i>
              Menunggu Review
            </h3>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
            </div>
          ) : pendingReview.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-check-double-line text-4xl text-green-400 mb-2"></i>
              <p className="text-gray-500">Tidak ada permit yang menunggu review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReview.slice(0, 5).map((permit) => (
                <Link key={permit.id} to={`/dashboard/permits/${permit.id}`}>
                  <div className="p-4 bg-warning-bg border border-warning/20 rounded-lg hover:bg-warning-bg/80 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-primary">{permit.permitNumber}</p>
                        <p className="text-sm text-text-muted">{permit.visitor?.fullName}</p>
                        <p className="text-xs text-text-muted mt-1">{permit.visitPurpose}</p>
                      </div>
                      <Button size="sm" variant="warning">Review</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Active Visitors */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              <i className="ri-user-follow-line text-success mr-2"></i>
              Visitor Aktif
            </h3>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
            </div>
          ) : activeVisitors.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-user-unfollow-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">Tidak ada visitor aktif saat ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeVisitors.map((permit) => (
                <Link key={permit.id} to={`/dashboard/permits/${permit.id}`}>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                          {permit.visitor?.fullName?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-600">{permit.visitor?.fullName}</p>
                          <p className="text-xs text-gray-500">{permit.dataCenter}</p>
                        </div>
                      </div>
                      <Badge variant="success" dot>Aktif</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PICDashboard;
