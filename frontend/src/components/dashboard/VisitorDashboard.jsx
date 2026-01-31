import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';

// Dashboard untuk Visitor - fokus pada permit milik mereka
const VisitorDashboard = ({ user, stats, permits, loading, formatDate, getStatusBadge }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard Visitor</h1>
          <p className="text-text-muted">Selamat datang, {user?.fullName}! Kelola working permit Anda di sini.</p>
        </div>
        <Link to="/dashboard/permits/new">
          <Button icon={<i className="ri-add-line"></i>}>
            Ajukan Permit Baru
          </Button>
        </Link>
      </div>

      {/* Stats untuk Visitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Total Permit</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-info-bg text-info">
              <i className="ri-file-list-3-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Menunggu Approval</p>
              <p className="text-3xl font-bold text-primary">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning-bg text-warning">
              <i className="ri-time-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Disetujui</p>
              <p className="text-3xl font-bold text-primary">{stats.active}</p>
            </div>
            <div className="p-3 rounded-xl bg-success-bg text-success">
              <i className="ri-check-line text-xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Ditolak</p>
              <p className="text-3xl font-bold text-primary">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-xl bg-danger-bg text-danger">
              <i className="ri-close-line text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-linear-to-r from-info to-info/80 text-white">
        <div className="flex items-center gap-4">
          <i className="ri-information-line text-4xl"></i>
          <div>
            <h3 className="font-bold text-lg">Informasi Penting</h3>
            <p className="opacity-90">Pastikan Anda membawa QR Code dan kode OTP saat check-in di Data Center. Kode OTP akan dikirim ke email Anda setelah permit disetujui.</p>
          </div>
        </div>
      </Card>

      {/* Recent Permits */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-primary">Permit Terbaru Saya</h3>
          <Link to="/dashboard/permits">
            <Button variant="ghost" size="sm">Lihat Semua</Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
          </div>
        ) : permits.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-file-list-3-line text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">Belum ada permit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {permits.slice(0, 5).map((permit) => (
              <Link key={permit.id} to={`/dashboard/permits/${permit.id}`}>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-dark-600">{permit.permitNumber}</p>
                    <p className="text-sm text-gray-500">{permit.visitPurpose}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(permit.status)}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(permit.scheduledStartTime)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default VisitorDashboard;
