import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useApprovals } from '../../hooks';
import { permitService } from '../../services/permitService';
import approvalService from '../../services/approvalService';
import mutasiService from '../../services/mutasiService';

const ApprovalList = () => {
  const { user, isPIC, isManager } = useAuth();
  const { approvals, loading, fetchPICPending, fetchManagerPending, picReview, managerApprove } = useApprovals();
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  
  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Mutasi Barang pending
  const [mutasiPending, setMutasiPending] = useState([]);
  const [mutasiLoading, setMutasiLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
    loadMutasiPending();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadApprovals = async () => {
    try {
      if (isPIC) {
        await fetchPICPending(user.userId);
      } else if (isManager) {
        await fetchManagerPending(user.userId);
      }
    } catch (error) {
      console.error('Error loading approvals:', error);
    }
  };
  
  const loadMutasiPending = async () => {
    setMutasiLoading(true);
    try {
      const all = await mutasiService.getAll();
      // Filter berdasarkan role
      let filtered = [];
      if (isPIC) {
        filtered = all.filter(m => m.status === 'PENDING_PIC');
      } else if (isManager) {
        filtered = all.filter(m => m.status === 'PENDING_MANAGER');
      }
      setMutasiPending(filtered);
    } catch (error) {
      console.error('Error loading mutasi pending:', error);
    } finally {
      setMutasiLoading(false);
    }
  };
  
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      // Load permit approval history
      const permitHistory = await approvalService.getHistory(user.userId);
      
      // Load mutasi barang yang sudah di-approve/reject oleh user ini
      const allMutasi = await mutasiService.getAll();
      const mutasiHistory = allMutasi.filter(m => {
        // Check if current user approved/rejected
        if (m.status === 'APPROVED' || m.status === 'COMPLETED') {
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
        approvalDate: m.picApprovedAt || m.managerApprovedAt || m.rejectedAt
      }));
      
      // Combine and add type
      const permitHistoryWithType = permitHistory.map(h => ({
        ...h,
        type: 'permit',
        approvalDate: h.reviewedAt || h.createdAt
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
      setHistoryLoading(false);
    }
  };

  const handleApprove = async (approval) => {
    setProcessing(approval.id);
    try {
      const approvalData = {
        permitId: approval.workingPermit?.id || approval.permitId,
        approved: true,
        comments: 'Approved',
      };

      if (isPIC) {
        await picReview(approvalData, user.userId);
      } else if (isManager) {
        await managerApprove(approvalData, user.userId);
      }

      await loadApprovals();
      await loadHistory();
    } catch (error) {
      console.error('Error approving:', error);
      alert(error.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (approval) => {
    setProcessing(approval.id);
    try {
      const approvalData = {
        permitId: approval.workingPermit?.id || approval.permitId,
        approved: false,
        comments: rejectReason || 'Rejected',
      };

      if (isPIC) {
        await picReview(approvalData, user.userId);
      } else if (isManager) {
        await managerApprove(approvalData, user.userId);
      }

      setShowRejectModal(null);
      setRejectReason('');
      await loadApprovals();
      await loadHistory();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert(error.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };
  
  // Mutasi approval handlers
  const handleApproveMutasiPIC = async (mutasi) => {
    setProcessing(`mutasi-${mutasi.id}`);
    try {
      await mutasiService.approvePIC(mutasi.id);
      await loadMutasiPending();
      await loadHistory();
    } catch (error) {
      alert('Gagal approve: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };
  
  const handleApproveMutasiManager = async (mutasi) => {
    setProcessing(`mutasi-${mutasi.id}`);
    try {
      await mutasiService.approveManager(mutasi.id);
      await loadMutasiPending();
      await loadHistory();
    } catch (error) {
      alert('Gagal approve: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };
  
  const handleRejectMutasi = async (mutasi) => {
    setProcessing(`mutasi-${mutasi.id}`);
    try {
      await mutasiService.reject(mutasi.id, rejectReason || 'Ditolak');
      setShowRejectModal(null);
      setRejectReason('');
      await loadMutasiPending();
      await loadHistory();
    } catch (error) {
      alert('Gagal reject: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  };
  
  const pendingCount = approvals.length + mutasiPending.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-600">Approval Queue</h1>
        <p className="text-gray-500">Review and manage pending permit & mutasi requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'history', label: 'History', count: history.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-primary-600'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-accent text-white' : 'bg-gray-300 text-gray-600'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Permit Approvals Section */}
          <div>
            <h3 className="text-lg font-semibold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-file-list-3-line text-primary-600"></i>
              Working Permit
              {approvals.length > 0 && (
                <Badge variant="warning">{approvals.length}</Badge>
              )}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <i className="ri-loader-4-line text-3xl text-primary-600 animate-spin"></i>
              </div>
            ) : approvals.length === 0 ? (
              <Card className="text-center py-8">
                <i className="ri-checkbox-circle-line text-4xl text-green-300 mb-2"></i>
                <p className="text-gray-400">Tidak ada permit pending</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval, index) => {
                  const permit = approval.workingPermit || {};
                  const visitor = permit.visitor || {};
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Left - Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between lg:justify-start gap-4 mb-3">
                            <span className="text-lg font-bold text-primary-600">{permit.permitNumber || `#${approval.id}`}</span>
                            <Badge variant={approval.approvalLevel === 'PIC' ? 'warning' : 'info'}>
                              {approval.approvalLevel || 'PENDING'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                              {visitor.fullName?.split(' ').map(n => n[0]).join('') || 'V'}
                            </div>
                            <div>
                              <p className="font-medium text-dark-600">{visitor.fullName || 'Unknown Visitor'}</p>
                              <p className="text-sm text-gray-500">{visitor.company || '-'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Purpose:</span>
                              <p className="font-medium text-dark-600">{permit.visitPurpose || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="font-medium text-dark-600">{permit.dataCenter || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <p className="font-medium text-dark-600">{formatDate(permit.scheduledStartTime)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Submitted:</span>
                              <p className="font-medium text-dark-600">{getTimeAgo(approval.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right - Actions */}
                        <div className="flex lg:flex-col gap-3 lg:w-40">
                          {permit.workOrderDocument && (
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
                              className="w-full"
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                icon={<i className="ri-file-text-line"></i>}
                              >
                                View Doc
                              </Button>
                            </button>
                          )}
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            icon={<i className="ri-check-line"></i>}
                            loading={processing === approval.id}
                            onClick={() => handleApprove(approval)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="flex-1"
                            icon={<i className="ri-close-line"></i>}
                            onClick={() => setShowRejectModal({ ...approval, type: 'permit' })}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Mutasi Barang Approvals Section */}
          <div>
            <h3 className="text-lg font-semibold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-exchange-box-line text-primary-600"></i>
              Mutasi Barang
              {mutasiPending.length > 0 && (
                <Badge variant="warning">{mutasiPending.length}</Badge>
              )}
            </h3>
            
            {mutasiLoading ? (
              <div className="flex justify-center py-8">
                <i className="ri-loader-4-line text-3xl text-primary-600 animate-spin"></i>
              </div>
            ) : mutasiPending.length === 0 ? (
              <Card className="text-center py-8">
                <i className="ri-checkbox-circle-line text-4xl text-green-300 mb-2"></i>
                <p className="text-gray-400">Tidak ada mutasi barang pending</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {mutasiPending.map((mutasi, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Left - Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between lg:justify-start gap-4 mb-3">
                          <span className="text-lg font-bold font-mono text-primary-600">{mutasi.nomor}</span>
                          <Badge variant={mutasi.status === 'PENDING_PIC' ? 'warning' : 'info'}>
                            {mutasi.status === 'PENDING_PIC' ? 'Menunggu PIC' : 'Menunggu Manager'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {mutasi.nama?.charAt(0)?.toUpperCase() || 'M'}
                          </div>
                          <div>
                            <p className="font-medium text-dark-600">{mutasi.nama || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{mutasi.jabatan || '-'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Lokasi:</span>
                            <p className="font-medium text-dark-600">{mutasi.lokasi?.replace('_', ' ') || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tanggal:</span>
                            <p className="font-medium text-dark-600">{formatDate(mutasi.tanggal)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Jumlah Item:</span>
                            <p className="font-medium text-dark-600">{mutasi.keterangan?.length || 0} barang</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Dibuat:</span>
                            <p className="font-medium text-dark-600">{getTimeAgo(mutasi.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex lg:flex-col gap-3 lg:w-40">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          icon={<i className="ri-eye-line"></i>}
                          onClick={() => window.location.href = `/dashboard/mutasi-barang/${mutasi.id}`}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1"
                          icon={<i className="ri-check-line"></i>}
                          loading={processing === `mutasi-${mutasi.id}`}
                          onClick={() => isPIC ? handleApproveMutasiPIC(mutasi) : handleApproveMutasiManager(mutasi)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          icon={<i className="ri-close-line"></i>}
                          onClick={() => setShowRejectModal({ ...mutasi, type: 'mutasi' })}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-bold text-dark-600 mb-4">
              {showRejectModal.type === 'mutasi' ? 'Tolak Mutasi Barang' : 'Reject Permit Request'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showRejectModal.type === 'mutasi' 
                ? 'Masukkan alasan penolakan mutasi barang ini.'
                : 'Please provide a reason for rejecting this permit request.'}
            </p>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows="3"
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={processing === showRejectModal.id || processing === `mutasi-${showRejectModal.id}`}
                onClick={() => showRejectModal.type === 'mutasi' 
                  ? handleRejectMutasi(showRejectModal) 
                  : handleReject(showRejectModal)}
              >
                Confirm Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <i className="ri-loader-4-line text-4xl text-primary-600 animate-spin"></i>
                <p className="text-gray-500">Memuat riwayat...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <Card className="text-center py-12">
              <i className="ri-history-line text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Riwayat</h3>
              <p className="text-gray-400">Riwayat approval akan muncul di sini setelah Anda menyetujui atau menolak permintaan</p>
            </Card>
          ) : (
            history.map((item, index) => {
              const isPermit = item.type === 'permit';
              const isMutasi = item.type === 'mutasi';
              const isApproved = isPermit 
                ? item.status === 'APPROVED' 
                : (item.status === 'APPROVED' || item.status === 'COMPLETED' || item.status === 'PENDING_MANAGER');
              const isRejected = item.status === 'REJECTED';
              
              return (
                <Card key={`${item.type}-${index}`} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isApproved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <i className={isApproved ? 'ri-check-line text-xl' : 'ri-close-line text-xl'}></i>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-dark-600">
                          {isPermit ? (item.workingPermit?.permitNumber || `Permit #${item.id}`) : item.nomor}
                        </span>
                        <Badge variant={isApproved ? 'success' : 'danger'}>
                          {isApproved ? 'Disetujui' : 'Ditolak'}
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
                              <p className="font-medium text-dark-600">{item.workingPermit?.visitor?.fullName || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Tujuan:</span>
                              <p className="font-medium text-dark-600">{item.workingPermit?.visitPurpose || '-'}</p>
                            </div>
                          </>
                        )}
                        {isMutasi && (
                          <>
                            <div>
                              <span className="text-gray-500">Pengaju:</span>
                              <p className="font-medium text-dark-600">{item.nama || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Lokasi:</span>
                              <p className="font-medium text-dark-600">{item.lokasi?.replace('_', ' ') || '-'}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-gray-500">Tanggal Aksi:</span>
                          <p className="font-medium text-dark-600">{formatDate(item.approvalDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Waktu:</span>
                          <p className="font-medium text-dark-600">{getTimeAgo(item.approvalDate)}</p>
                        </div>
                      </div>
                      
                      {/* Comments/Reason */}
                      {(item.comments || item.rejectionReason) && (
                        <div className="text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Catatan: </span>
                          <span className="text-dark-600">{item.comments || item.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action */}
                    <div>
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
      )}
    </div>
  );
};

export default ApprovalList;
