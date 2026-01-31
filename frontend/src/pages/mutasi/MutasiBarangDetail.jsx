import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mutasiService from '../../services/mutasiService';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../../components/ui';
import { generateMutasiPDF } from '../../utils/pdfGenerator';

export default function MutasiBarangDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isPIC = ['PIC', 'ADMINISTRATOR_ODC', 'ADMINISTRATOR_INFRA', 'ADMINISTRATOR_NETWORK'].includes(user?.role);
  const isManager = user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await mutasiService.getById(id);
      setData(result);
    } catch (err) {
      console.error('Failed to load data:', err);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePIC = async () => {
    if (!window.confirm('Approve mutasi barang ini?')) return;
    setActionLoading(true);
    try {
      await mutasiService.approvePIC(id);
      alert('Berhasil di-approve! Menunggu approval Manager.');
      loadData();
    } catch (err) {
      alert('Gagal approve: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveManager = async () => {
    if (!window.confirm('Approve mutasi barang ini?')) return;
    setActionLoading(true);
    try {
      await mutasiService.approveManager(id);
      alert('Mutasi barang berhasil di-approve!');
      loadData();
    } catch (err) {
      alert('Gagal approve: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    setActionLoading(true);
    try {
      await mutasiService.reject(id, rejectReason);
      alert('Mutasi barang ditolak');
      setRejectModal(false);
      setRejectReason('');
      loadData();
    } catch (err) {
      alert('Gagal reject: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Tandai mutasi barang ini sebagai selesai?')) return;
    setActionLoading(true);
    try {
      await mutasiService.complete(id);
      alert('Mutasi barang ditandai selesai');
      loadData();
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PIC':
        return <Badge variant="warning">Menunggu Approval PIC</Badge>;
      case 'PENDING_MANAGER':
        return <Badge variant="primary">Menunggu Approval Manager</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Ditolak</Badge>;
      case 'COMPLETED':
        return <Badge variant="gray">Selesai</Badge>;
      default:
        return <Badge variant="gray">{status || 'Draft'}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canApprovePIC = isPIC && data?.status === 'PENDING_PIC';
  const canApproveManager = isManager && data?.status === 'PENDING_MANAGER';
  const canReject = (isPIC && data?.status === 'PENDING_PIC') || (isManager && data?.status === 'PENDING_MANAGER');
  const canComplete = (isPIC || isManager || isAdmin) && data?.status === 'APPROVED';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <i className="ri-error-warning-line text-5xl text-red-400 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-600">Data tidak ditemukan</h3>
        <Button className="mt-4" onClick={() => navigate('/dashboard/mutasi-barang/list')}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-dark-600">
              <i className="ri-file-text-line text-primary-600 mr-2"></i>
              Detail Mutasi Barang
            </h1>
            {getStatusBadge(data.status)}
          </div>
          <p className="text-gray-500 font-mono">{data.nomor}</p>
        </div>
        <div className="flex gap-2">
          {data.documentPath && (
            <Button
              variant="secondary"
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/mutasi-barang/${id}/document`, '_blank')}
              icon={<i className="ri-file-text-line"></i>}
            >
              Lihat Dokumen
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/mutasi-barang/list')}
            icon={<i className="ri-arrow-left-line"></i>}
          >
            Kembali
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                generateMutasiPDF(data);
              } catch (e) {
                console.error('PDF Generation Error:', e);
                alert('Gagal export PDF: ' + e.message);
              }
            }}
            icon={<i className="ri-file-pdf-line"></i>}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <h3 className="font-bold text-dark-600 mb-4">
          <i className="ri-flow-chart text-primary-600 mr-2"></i>
          Status Approval
        </h3>
        <div className="flex items-center gap-4">
          {/* Step 1: Pengajuan */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.status ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
              <i className="ri-edit-line"></i>
            </div>
            <span className="text-xs mt-1 text-gray-600">Pengajuan</span>
          </div>
          <div className={`flex-1 h-1 ${data.status !== 'PENDING_PIC' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

          {/* Step 2: Review PIC */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.status === 'PENDING_MANAGER' || data.status === 'APPROVED' || data.status === 'COMPLETED'
              ? 'bg-green-500 text-white'
              : data.status === 'PENDING_PIC'
                ? 'bg-amber-500 text-white animate-pulse'
                : data.status === 'REJECTED' && !data.picApprovedAt
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
              <i className="ri-user-star-line"></i>
            </div>
            <span className="text-xs mt-1 text-gray-600">Review PIC</span>
          </div>
          <div className={`flex-1 h-1 ${data.status === 'APPROVED' || data.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>

          {/* Step 3: Approval Manager */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.status === 'APPROVED' || data.status === 'COMPLETED'
              ? 'bg-green-500 text-white'
              : data.status === 'PENDING_MANAGER'
                ? 'bg-amber-500 text-white animate-pulse'
                : data.status === 'REJECTED' && data.picApprovedAt
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
              <i className="ri-admin-line"></i>
            </div>
            <span className="text-xs mt-1 text-gray-600">Approval Manager</span>
          </div>
          <div className={`flex-1 h-1 ${data.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

          {/* Step 4: Selesai */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.status === 'COMPLETED'
              ? 'bg-green-500 text-white'
              : data.status === 'APPROVED'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500'
              }`}>
              <i className="ri-check-double-line"></i>
            </div>
            <span className="text-xs mt-1 text-gray-600">Selesai</span>
          </div>
        </div>

        {/* Rejection reason if rejected */}
        {data.status === 'REJECTED' && data.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-700 flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              Alasan Penolakan
            </h4>
            <p className="text-red-600 mt-1">{data.rejectionReason}</p>
            {data.rejectedBy && (
              <p className="text-xs text-red-500 mt-2">
                Ditolak oleh: {data.rejectedBy.fullName || data.rejectedBy.username} pada {formatDateTime(data.rejectedAt)}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      {(canApprovePIC || canApproveManager || canReject || canComplete) && (
        <Card className="bg-linear-to-r from-primary-50 to-blue-50 border-primary-200">
          <h3 className="font-bold text-dark-600 mb-4">
            <i className="ri-checkbox-circle-line text-primary-600 mr-2"></i>
            Aksi
          </h3>
          <div className="flex flex-wrap gap-3">
            {canApprovePIC && (
              <Button
                onClick={handleApprovePIC}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
                icon={<i className="ri-check-line"></i>}
              >
                Approve (PIC)
              </Button>
            )}
            {canApproveManager && (
              <Button
                onClick={handleApproveManager}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
                icon={<i className="ri-check-double-line"></i>}
              >
                Approve (Manager)
              </Button>
            )}
            {canReject && (
              <Button
                onClick={() => setRejectModal(true)}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
                icon={<i className="ri-close-line"></i>}
              >
                Tolak
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={handleComplete}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700"
                icon={<i className="ri-checkbox-circle-line"></i>}
              >
                Tandai Selesai
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Pemohon */}
        <Card>
          <h3 className="font-bold text-dark-600 mb-4">
            <i className="ri-user-line text-primary-600 mr-2"></i>
            Informasi Pemohon
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                {data.nama?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-dark-600">{data.nama || '-'}</p>
                <p className="text-sm text-gray-500">{data.jabatan || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-medium text-dark-600">{data.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Telepon</p>
                <p className="font-medium text-dark-600">{data.telepon || '-'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detail Mutasi */}
        <Card>
          <h3 className="font-bold text-dark-600 mb-4">
            <i className="ri-file-list-3-line text-primary-600 mr-2"></i>
            Detail Mutasi
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Nomor Mutasi</p>
                <p className="font-mono font-medium text-dark-600">{data.nomor || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tanggal</p>
                <p className="font-medium text-dark-600">{formatDate(data.tanggal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Lokasi Data Center</p>
                <p className="font-medium text-dark-600">{data.lokasi?.replace('_', ' ') || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tim Pendamping</p>
                <p className="font-medium text-dark-600">{data.teamPendamping?.replace('_', ' ') || '-'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Keterangan Perangkat */}
      <Card>
        <h3 className="font-bold text-dark-600 mb-4">
          <i className="ri-server-line text-primary-600 mr-2"></i>
          Keterangan Perangkat
          <Badge variant="primary" className="ml-2">{data.keterangan?.length || 0} Item</Badge>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Barang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rak Asal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rak Tujuan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Merk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Serial Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.keterangan && data.keterangan.length > 0 ? (
                data.keterangan.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-dark-600">{item.namaBarang || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.rakAsal || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.rakTujuan || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.merk || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.tipe || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.serialNumber || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data perangkat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approval History */}
      <Card>
        <h3 className="font-bold text-dark-600 mb-4">
          <i className="ri-history-line text-primary-600 mr-2"></i>
          Riwayat Approval
        </h3>
        <div className="space-y-4">
          {/* Created */}
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="ri-file-add-line"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-600">Pengajuan Dibuat</p>
              <p className="text-sm text-gray-500">
                Oleh: {data.createdBy?.fullName || data.createdBy?.username || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400">{formatDateTime(data.createdAt)}</p>
            </div>
          </div>

          {/* PIC Approved */}
          {data.picApprovedAt && (
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <i className="ri-user-star-line"></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-700">Disetujui oleh PIC</p>
                {data.picNotes && <p className="text-sm text-gray-600">Catatan: {data.picNotes}</p>}
                <p className="text-xs text-gray-400">{formatDateTime(data.picApprovedAt)}</p>
              </div>
            </div>
          )}

          {/* Manager Approved */}
          {data.managerApprovedAt && (
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <i className="ri-admin-line"></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-700">Disetujui oleh Manager</p>
                <p className="text-sm text-gray-500">
                  Oleh: {data.approvedByManager?.fullName || data.approvedByManager?.username || 'Manager'}
                </p>
                {data.managerNotes && <p className="text-sm text-gray-600">Catatan: {data.managerNotes}</p>}
                <p className="text-xs text-gray-400">{formatDateTime(data.managerApprovedAt)}</p>
              </div>
            </div>
          )}

          {/* Rejected */}
          {data.rejectedAt && (
            <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <i className="ri-close-circle-line"></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-700">Ditolak</p>
                <p className="text-sm text-gray-500">
                  Oleh: {data.rejectedBy?.fullName || data.rejectedBy?.username || 'Unknown'}
                </p>
                <p className="text-sm text-red-600">Alasan: {data.rejectionReason}</p>
                <p className="text-xs text-gray-400">{formatDateTime(data.rejectedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>



      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-dark-600 mb-4">
              <i className="ri-error-warning-line text-red-500 mr-2"></i>
              Tolak Mutasi Barang
            </h3>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Masukkan alasan penolakan..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setRejectModal(false); setRejectReason(''); }}
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Processing...' : 'Tolak'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
