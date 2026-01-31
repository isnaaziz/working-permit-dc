import React, { useEffect, useState } from 'react';
import mutasiService from '../../services/mutasiService';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function MutasiBarangList() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  const isPIC = ['PIC', 'ADMINISTRATOR_ODC', 'ADMINISTRATOR_INFRA', 'ADMINISTRATOR_NETWORK'].includes(user?.role);
  const isManager = user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await mutasiService.getAll();
      setData(result);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await mutasiService.getStats();
      setStats(result);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDelete = async (id, nomor) => {
    if (window.confirm(`Yakin hapus mutasi barang ${nomor}?`)) {
      try {
        await mutasiService.remove(id);
        setData(data.filter(item => item.id !== id));
      } catch (err) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleApprovePIC = async (id) => {
    if (!window.confirm('Approve mutasi barang ini?')) return;
    try {
      await mutasiService.approvePIC(id);
      alert('Berhasil di-approve! Menunggu approval Manager.');
      loadData();
      loadStats();
    } catch (err) {
      alert('Gagal approve: ' + (err.message || 'Unknown error'));
    }
  };

  const handleApproveManager = async (id) => {
    if (!window.confirm('Approve mutasi barang ini?')) return;
    try {
      await mutasiService.approveManager(id);
      alert('Mutasi barang berhasil di-approve!');
      loadData();
      loadStats();
    } catch (err) {
      alert('Gagal approve: ' + (err.message || 'Unknown error'));
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    try {
      await mutasiService.reject(rejectModal.id, rejectReason);
      alert('Mutasi barang ditolak');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      loadData();
      loadStats();
    } catch (err) {
      alert('Gagal reject: ' + (err.message || 'Unknown error'));
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Tandai mutasi barang ini sebagai selesai?')) return;
    try {
      await mutasiService.complete(id);
      alert('Mutasi barang ditandai selesai');
      loadData();
      loadStats();
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredData = data.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.nomor || '').toLowerCase().includes(query) ||
      (item.nama || '').toLowerCase().includes(query) ||
      (item.jabatan || '').toLowerCase().includes(query) ||
      (item.lokasi || '').toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PIC':
        return <Badge variant="warning">Menunggu PIC</Badge>;
      case 'PENDING_MANAGER':
        return <Badge variant="primary">Menunggu Manager</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Ditolak</Badge>;
      case 'COMPLETED':
        return <Badge variant="gray">Selesai</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">Dibatalkan</Badge>;
      default:
        return <Badge variant="gray">{status || 'Draft'}</Badge>;
    }
  };

  const canApprove = (item) => {
    if (isPIC && item.status === 'PENDING_PIC') return 'pic';
    if (isManager && item.status === 'PENDING_MANAGER') return 'manager';
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">
            <i className="ri-exchange-line text-primary-600 mr-2"></i>
            Mutasi Barang
          </h1>
          <p className="text-gray-500">Kelola data mutasi barang data center</p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/mutasi-barang')}
          icon={<i className="ri-add-line"></i>}
        >
          Ajukan Mutasi Baru
        </Button>
      </div>

      {/* Stats Cards - Dynamic based on role */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isAdmin && (
          <>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <i className="ri-file-list-3-line text-xl text-primary-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.total || 0}</p>
                <p className="text-xs text-gray-500">Total Mutasi</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="ri-time-line text-xl text-amber-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{(stats.pendingPIC || 0) + (stats.pendingManager || 0)}</p>
                <p className="text-xs text-gray-500">Menunggu Approval</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.approved || 0}</p>
                <p className="text-xs text-gray-500">Disetujui</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <i className="ri-close-circle-line text-xl text-red-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.rejected || 0}</p>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </Card>
          </>
        )}
        {isPIC && (
          <>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="ri-time-line text-xl text-amber-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.pendingPIC || 0}</p>
                <p className="text-xs text-gray-500">Menunggu Approval Anda</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.approved || 0}</p>
                <p className="text-xs text-gray-500">Sudah Diproses</p>
              </div>
            </Card>
          </>
        )}
        {isManager && (
          <>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="ri-time-line text-xl text-amber-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.pendingManager || 0}</p>
                <p className="text-xs text-gray-500">Menunggu Approval Anda</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.approved || 0}</p>
                <p className="text-xs text-gray-500">Disetujui</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <i className="ri-check-double-line text-xl text-gray-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.completed || 0}</p>
                <p className="text-xs text-gray-500">Selesai</p>
              </div>
            </Card>
          </>
        )}
        {!isPIC && !isManager && !isAdmin && (
          <>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <i className="ri-file-list-3-line text-xl text-primary-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.myTotal || 0}</p>
                <p className="text-xs text-gray-500">Total Pengajuan Saya</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="ri-time-line text-xl text-amber-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.myPending || 0}</p>
                <p className="text-xs text-gray-500">Menunggu Approval</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.myApproved || 0}</p>
                <p className="text-xs text-gray-500">Disetujui</p>
              </div>
            </Card>
            <Card padding="sm" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <i className="ri-close-circle-line text-xl text-red-600"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-600">{stats.myRejected || 0}</p>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari nomor, nama, jabatan..."
              icon={<i className="ri-search-line"></i>}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => { loadData(); loadStats(); }} icon={<i className="ri-refresh-line"></i>}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Data Table */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-dark-600">
            <i className="ri-table-line mr-2 text-primary-600"></i>
            Daftar Mutasi Barang
          </h3>
          <span className="text-sm text-gray-500">{filteredData.length} data</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak Ada Data</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'Tidak ada data yang cocok dengan pencarian' : 'Belum ada data mutasi barang'}
            </p>
            <Button onClick={() => navigate('/dashboard/mutasi-barang')} icon={<i className="ri-add-line"></i>}>
              Ajukan Mutasi Baru
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor Mutasi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pemohon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lokasi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <span className="font-mono font-medium text-dark-600">{item.nomor || '-'}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(item.tanggal)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {item.nama?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="font-medium text-dark-600">{item.nama || '-'}</p>
                          <p className="text-xs text-gray-500">{item.jabatan || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.lokasi?.replace('_', ' ') || '-'}</td>
                    <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* Approval buttons */}
                        {canApprove(item) === 'pic' && (
                          <>
                            <button
                              onClick={() => handleApprovePIC(item.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, id: item.id })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </>
                        )}
                        {canApprove(item) === 'manager' && (
                          <>
                            <button
                              onClick={() => handleApproveManager(item.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, id: item.id })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </>
                        )}
                        {/* Complete button for approved items */}
                        {item.status === 'APPROVED' && (isPIC || isManager || isAdmin) && (
                          <button
                            onClick={() => handleComplete(item.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Tandai Selesai"
                          >
                            <i className="ri-check-double-line"></i>
                          </button>
                        )}
                        {/* View/Edit button */}
                        <button
                          onClick={() => navigate(`/dashboard/mutasi-barang/${item.id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        {/* Delete button - only for creator and if not approved */}
                        {item.status === 'PENDING_PIC' && (
                          <button
                            onClick={() => handleDelete(item.id, item.nomor)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-dark-600 mb-4">
              <i className="ri-error-warning-line text-red-500 mr-2"></i>
              Tolak Mutasi Barang
            </h3>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2">Alasan Penolakan <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Masukkan alasan penolakan..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }}>
                Batal
              </Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
