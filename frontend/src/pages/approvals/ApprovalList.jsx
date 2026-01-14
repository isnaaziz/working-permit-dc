import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useApprovals } from '../../hooks';

const ApprovalList = () => {
  const { user, isPIC, isManager } = useAuth();
  const { approvals, loading, fetchPICPending, fetchManagerPending, picReview, managerApprove } = useApprovals();
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    loadApprovals();
  }, [user]);

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
      
      // Reload approvals
      await loadApprovals();
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
      // Reload approvals
      await loadApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert(error.message || 'Failed to reject');
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
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-600">Approval Queue</h1>
        <p className="text-gray-500">Review and manage pending permit requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'pending', label: 'Pending', count: 3 },
          { id: 'history', label: 'History', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            {tab.label}
            {tab.count && (
              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <i className="ri-loader-4-line text-4xl text-primary-600 animate-spin"></i>
                <p className="text-gray-500">Loading approvals...</p>
              </div>
            </div>
          ) : approvals.length === 0 ? (
            <Card className="text-center py-12">
              <i className="ri-checkbox-circle-line text-5xl text-green-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">All caught up!</h3>
              <p className="text-gray-400">No pending approvals at the moment</p>
            </Card>
          ) : (
            approvals.map((approval, index) => {
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
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
                        onClick={() => setShowRejectModal(approval)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-bold text-dark-600 mb-4">Reject Permit Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this permit request.
            </p>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows="3"
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectModal(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                loading={processing === showRejectModal.id}
                onClick={() => handleReject(showRejectModal)}
              >
                Confirm Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card className="text-center py-12">
          <i className="ri-history-line text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Approval History</h3>
          <p className="text-gray-400">View your past approval decisions</p>
        </Card>
      )}
    </div>
  );
};

export default ApprovalList;
