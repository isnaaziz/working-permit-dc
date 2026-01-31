import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { usePermits } from '../../hooks';
import { permitService } from '../../services/permitService';

const PermitDetail = () => {
  const { id } = useParams();
  const { permit, loading, error, fetchById } = usePermits();
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line text-4xl text-primary-600 animate-spin"></i>
          <p className="text-gray-500">Loading permit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mb-4">
          <i className="ri-error-warning-line text-3xl text-danger"></i>
        </div>
        <h3 className="text-lg font-semibold text-dark-600 mb-2">Error Loading Permit</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/dashboard/permits">
          <Button variant="outline">Back to Permits</Button>
        </Link>
      </div>
    );
  }

  if (!permit) {
    return null; // Or a specific "Not Found" state
  }

  const getStatusBadge = (status) => {
    const config = {
      APPROVED: { variant: 'success', label: 'Approved' },
      PENDING_PIC: { variant: 'warning', label: 'Pending PIC' },
      PENDING_MANAGER: { variant: 'info', label: 'Pending Manager' },
      SUBMITTED: { variant: 'gray', label: 'Submitted' },
      REJECTED: { variant: 'danger', label: 'Rejected' },
      ACTIVE: { variant: 'success', label: 'Active' },
      COMPLETED: { variant: 'primary', label: 'Completed' },
      CANCELLED: { variant: 'gray', label: 'Cancelled' },
    };
    const cfg = config[status] || { variant: 'gray', label: status };
    return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Breadcrumb - Hide on print */}
      <div className="flex items-center gap-2 text-sm text-gray-500 print:hidden">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <i className="ri-arrow-right-s-line"></i>
        <Link to="/dashboard/permits" className="hover:text-primary-600">My Permits</Link>
        <i className="ri-arrow-right-s-line"></i>
        <span className="text-dark-600 font-medium">{permit.permitNumber}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center print:hidden">
            <i className="ri-file-text-line text-2xl text-primary-600"></i>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-600">{permit.permitNumber}</h1>
              {getStatusBadge(permit.status)}
            </div>
            <p className="text-gray-500">{permit.visitPurpose}</p>
          </div>
        </div>
        {/* Actions - Hide on print */}
        <div className="flex gap-3 print:hidden">
          <Button variant="outline" icon={<i className="ri-printer-line"></i>} onClick={handlePrint}>
            Print
          </Button>
          {(permit.status === 'APPROVED' || permit.status === 'ACTIVE') && (permit.qrCode || permit.qrCodeBase64) && (
            <Button icon={<i className="ri-qr-code-line"></i>} onClick={() => setShowQRModal(true)}>
              Show QR Code
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 print:block print:space-y-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Details */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-briefcase-line text-primary-600"></i>
              Work Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Purpose</label>
                <p className="font-medium text-dark-600">{permit.visitPurpose}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="text-gray-600">{permit.workDescription || 'No description provided.'}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Team Members</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {permit.teamMembers && permit.teamMembers.length > 0 ? (
                      permit.teamMembers.map((member, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm border border-gray-200">{member.fullName}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No team members listed</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Equipment</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {permit.equipmentList && permit.equipmentList.length > 0 ? (
                      permit.equipmentList.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm border border-primary-100">{item.name}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No equipment listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Download - Only for PIC, Manager, Security, or Owner */}
            {permit.workOrderDocument && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-sm text-gray-500 block mb-2">Attached Document</label>
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-dark-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="ri-file-text-line text-primary-600"></i>
                  View Supporting Document
                </button>
              </div>
            )}
          </Card>

          {/* Schedule & Location */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-calendar-line text-primary-600"></i>
              Schedule & Location
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 print:hidden">
                  <i className="ri-map-pin-line text-primary-600"></i>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-medium text-dark-600">{permit.dataCenter}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0 print:hidden">
                  <i className="ri-calendar-check-line text-success"></i>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date</label>
                  <p className="font-medium text-dark-600">{formatDate(permit.scheduledStartTime)}</p>
                  <p className="text-sm text-gray-500">to {formatDate(permit.scheduledEndTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 print:hidden">
                  <i className="ri-time-line text-warning"></i>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Time</label>
                  <p className="font-medium text-dark-600">{formatTime(permit.scheduledStartTime)} - {formatTime(permit.scheduledEndTime)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Approval History - Hide on Print? Maybe keep it. Removing print:hidden logic to show in print unless requested otherwise */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-history-line text-primary-600"></i>
              Approval History
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {permit.approvalHistory && permit.approvalHistory.length > 0 ? (
                  permit.approvalHistory.map((history, index) => (
                    <div key={index} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${history.status === 'APPROVED' ? 'bg-success text-white' :
                        history.status === 'REJECTED' ? 'bg-danger text-white' :
                          'bg-info text-white'
                        }`}>
                        <i className={`text-sm ${history.status === 'APPROVED' ? 'ri-check-line' :
                          history.status === 'REJECTED' ? 'ri-close-line' :
                            'ri-time-line'
                          }`}></i>
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark-600">{history.status.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-400">{formatDate(history.actionDate, true)}</span>
                        </div>
                        <p className="text-sm text-gray-500">by {history.actionBy?.fullName || 'System'}</p>
                        {history.remarks && (
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{history.remarks}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic pl-6">No history available</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code (if approved) */}
          {(permit.status === 'APPROVED' || permit.status === 'ACTIVE') && (permit.qrCode || permit.qrCodeBase64) && (
            <Card className="text-center">
              <h3 className="font-bold text-dark-600 mb-4">Access QR Code</h3>
              <div className="bg-white p-4 rounded-xl border border-gray-100 inline-block mb-4">
                <img
                  src={permit.qrCodeBase64 ? `data:image/png;base64,${permit.qrCodeBase64}` : permit.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              {/* OTP often managed separately or embedded in QR response. Displaying if available in permit object */}
              {(permit.otp || permit.otpCode) && (
                <>
                  <p className="text-sm text-gray-500 mb-2">OTP Code:</p>
                  <p className="text-3xl font-bold text-primary-600 tracking-wider">{permit.otp || permit.otpCode}</p>
                </>
              )}
              <p className="text-xs text-gray-400 mt-2">Show this to security at check-in</p>
            </Card>
          )}

          {/* Visitor Info */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-user-line text-primary-600"></i>
              Visitor
            </h3>
            {permit.visitor && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold print:border print:border-gray-300 print:text-black">
                    {permit.visitor.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-600">{permit.visitor.fullName}</p>
                    <p className="text-sm text-gray-500">{permit.visitor.companyName || 'Visitor'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="ri-mail-line text-gray-400"></i>
                    {permit.visitor.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="ri-phone-line text-gray-400"></i>
                    {permit.visitor.phoneNumber || '-'}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* PIC Info */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-4 flex items-center gap-2">
              <i className="ri-user-star-line text-primary-600"></i>
              Person in Charge
            </h3>
            {permit.pic ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold print:border print:border-gray-300 print:text-black">
                    {permit.pic.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-600">{permit.pic.fullName}</p>
                    <p className="text-sm text-gray-500">Data Center Staff</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="ri-mail-line text-gray-400"></i>
                    {permit.pic.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="ri-phone-line text-gray-400"></i>
                    {permit.pic.phoneNumber || '-'}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No PIC assigned yet.</p>
            )}
          </Card>
        </div>
      </div >

      {/* QR Code Modal */}
      {
        showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>

              <div className="text-center pt-4">
                <h3 className="text-xl font-bold text-dark-600 mb-2">Access QR Code</h3>
                <p className="text-gray-500 text-sm mb-6">Scan this code at the security checkpoint</p>

                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6 relative group">
                  <img
                    src={permit.qrCodeBase64 ? `data:image/png;base64,${permit.qrCodeBase64}` : permit.qrCode}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>

                {(permit.otp || permit.otpCode) && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">OTP Verification Code</p>
                    <p className="text-4xl font-mono font-bold text-primary-600 tracking-[0.2em]">{permit.otp || permit.otpCode}</p>
                  </div>
                )}

                <p className="text-xs text-center text-gray-400">
                  This QR code is valid for: <br />
                  <span className="font-medium text-gray-600">{formatDate(permit.scheduledStartTime)} - {formatDate(permit.scheduledEndTime)}</span>
                </p>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowQRModal(false)}>Close</Button>
                  <Button className="flex-1" icon={<i className="ri-download-line"></i>}>Save Image</Button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default PermitDetail;
