import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import approvalService from '../../services/approvalService';
import mutasiService from '../../services/mutasiService';

const ApprovalHistory = () => {
  const { user, isPIC, isManager } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, rejected
  const [typeFilter, setTypeFilter] = useState('all'); // all, permit, mutasi

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Load permit approval history
      const permitHistory = await approvalService.getHistory(user.userId);
      
      // Load mutasi barang yang sudah di-approve/reject oleh user ini
      const allMutasi = await mutasiService.getAll();
      const mutasiHistory = allMutasi.filter(m => {
        // Check if current user approved/rejected
        if (m.status === 'APPROVED' || m.status === 'COMPLETED' || m.status === 'PENDING_MANAGER') {
          if (isPIC && m.picApprovedAt) return true;
          if (isManager && m.managerApprovedAt) return true;
        }
        if (m.status === 'REJECTED') {
          if (m.rejectedBy?.id === user.userId) return true;
        }
        return false;
      }).map(m => ({
        ...m,
        type: 'mutasi',
        approvalDate: m.picApprovedAt || m.managerApprovedAt || m.rejectedAt,
        isApproved: m.status !== 'REJECTED'
      }));
      
      // Combine and add type
      const permitHistoryWithType = permitHistory.map(h => ({
        ...h,
        type: 'permit',
        approvalDate: h.reviewedAt || h.createdAt,
        isApproved: h.status === 'APPROVED'
      }));
      
      // Combine and sort by date
      const combined = [...permitHistoryWithType, ...mutasiHistory].sort((a, b) => {
        const dateA = new Date(a.approvalDate || 0);
        const dateB = new Date(b.approvalDate || 0);
        return dateB - dateA;
      });
      
      setHistory(combined);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari yang lalu`;
    const months = Math.floor(days / 30);
    return `${months} bulan yang lalu`;
  };

  // Filter history
  const filteredHistory = history.filter(item => {
    // Filter by status
    if (filter === 'approved' && !item.isApproved) return false;
    if (filter === 'rejected' && item.isApproved) return false;
    
    // Filter by type
    if (typeFilter === 'permit' && item.type !== 'permit') return false;
    if (typeFilter === 'mutasi' && item.type !== 'mutasi') return false;
    
    return true;
  });

  // Stats
  const stats = {
    total: history.length,
    approved: history.filter(h => h.isApproved).length,
    rejected: history.filter(h => !h.isApproved).length,
    permits: history.filter(h => h.type === 'permit').length,
    mutasi: history.filter(h => h.type === 'mutasi').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-600">
          <i className="ri-history-line text-primary-600 mr-2"></i>
          Riwayat Approval
        </h1>
        <p className="text-gray-500">Lihat riwayat keputusan approval yang telah Anda lakukan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-500">Disetujui</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-500">Ditolak</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.permits}</div>
          <div className="text-sm text-gray-500">Working Permit</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.mutasi}</div>
          <div className="text-sm text-gray-500">Mutasi Barang</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'rejected', label: 'Ditolak' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Semua Tipe' },
            { id: 'permit', label: 'Working Permit' },
            { id: 'mutasi', label: 'Mutasi Barang' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === f.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <i className="ri-loader-4-line text-4xl text-primary-600 animate-spin"></i>
              <p className="text-gray-500">Memuat riwayat...</p>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="text-center py-12">
            <i className="ri-history-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak Ada Riwayat</h3>
            <p className="text-gray-400">
              {filter !== 'all' || typeFilter !== 'all' 
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Riwayat approval akan muncul di sini setelah Anda menyetujui atau menolak permintaan'}
            </p>
          </Card>
        ) : (
          filteredHistory.map((item, index) => {
            const isPermit = item.type === 'permit';
            const isMutasi = item.type === 'mutasi';
            
            return (
              <Card key={`${item.type}-${item.id}-${index}`} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    item.isApproved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={item.isApproved ? 'ri-check-line text-xl' : 'ri-close-line text-xl'}></i>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-dark-600 truncate">
                        {isPermit ? (item.workingPermit?.permitNumber || `Permit #${item.id}`) : item.nomor}
                      </span>
                      <Badge variant={item.isApproved ? 'success' : 'danger'}>
                        {item.isApproved ? 'Disetujui' : 'Ditolak'}
                      </Badge>
                      <Badge variant={isPermit ? 'primary' : 'warning'}>
                        {isPermit ? 'Working Permit' : 'Mutasi Barang'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                      {isPermit && (
                        <>
                          <div>
                            <span className="text-gray-500">Pengaju:</span>
                            <p className="font-medium text-dark-600 truncate">{item.workingPermit?.visitor?.fullName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tujuan:</span>
                            <p className="font-medium text-dark-600 truncate">{item.workingPermit?.visitPurpose || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Lokasi:</span>
                            <p className="font-medium text-dark-600">{item.workingPermit?.dataCenter || '-'}</p>
                          </div>
                        </>
                      )}
                      {isMutasi && (
                        <>
                          <div>
                            <span className="text-gray-500">Pengaju:</span>
                            <p className="font-medium text-dark-600 truncate">{item.nama || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Lokasi:</span>
                            <p className="font-medium text-dark-600">{item.lokasi?.replace('_', ' ') || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Jumlah Item:</span>
                            <p className="font-medium text-dark-600">{item.keterangan?.length || 0} barang</p>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-gray-500">Waktu Aksi:</span>
                        <p className="font-medium text-dark-600">{getTimeAgo(item.approvalDate)}</p>
                      </div>
                    </div>
                    
                    {/* Date/Time Detail */}
                    <div className="text-xs text-gray-400 mb-2">
                      <i className="ri-time-line mr-1"></i>
                      {formatDateTime(item.approvalDate)}
                    </div>
                    
                    {/* Comments/Reason */}
                    {(item.comments || item.rejectionReason) && (
                      <div className={`text-sm p-2 rounded ${
                        item.isApproved ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <span className="text-gray-500">
                          {item.isApproved ? 'Catatan: ' : 'Alasan Penolakan: '}
                        </span>
                        <span className="text-dark-600">{item.comments || item.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action */}
                  <div className="shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (isPermit) {
                          window.location.href = `/dashboard/permits/${item.workingPermit?.id}`;
                        } else {
                          window.location.href = `/dashboard/mutasi-barang/${item.id}`;
                        }
                      }}
                    >
                      <i className="ri-eye-line"></i>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Summary Footer */}
      {!loading && filteredHistory.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Menampilkan {filteredHistory.length} dari {history.length} riwayat
        </div>
      )}
    </div>
  );
};

export default ApprovalHistory;
