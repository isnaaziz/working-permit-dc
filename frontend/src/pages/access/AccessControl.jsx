import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from '../../hooks';
import { permitService } from '../../services';

const AccessControl = () => {
  const { user } = useAuth();
  const { verify, checkIn, checkOut, fetchLogs, loading: accessLoading } = useAccess();

  const [activeTab, setActiveTab] = useState('scan');
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Load active visitors (checked-in but not checked-out)
  const loadActiveVisitors = async () => {
    setLoadingVisitors(true);
    try {
      // Get permits with ACTIVE status (checked in)
      const permits = await permitService.getByStatus('ACTIVE');
      const visitors = permits.map(permit => ({
        id: permit.id,
        name: permit.visitor?.fullName || 'Unknown',
        company: permit.visitor?.company || '-',
        permitId: permit.permitNumber,
        checkInTime: permit.actualCheckInTime ? new Date(permit.actualCheckInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        area: permit.dataCenter?.replace('_', ' ') || permit.dataCenter,
        permitData: permit
      }));
      setActiveVisitors(visitors);
    } catch (err) {
      console.error('Failed to load active visitors:', err);
    } finally {
      setLoadingVisitors(false);
    }
  };

  useEffect(() => {
    loadActiveVisitors();
  }, []);

  const handleVerify = async () => {
    if (!qrCode.trim()) {
      setError('Please enter permit ID or scan QR code');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter OTP code');
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      const result = await verify(qrCode.trim(), otp.trim());

      if (result && result.valid) {
        setVerificationResult({
          success: true,
          permit: result.permit,
          visitor: {
            name: result.permit?.visitor?.fullName || 'Unknown',
            company: result.permit?.visitor?.company || '-',
            permitId: result.permit?.permitNumber || qrCode,
            purpose: result.permit?.visitPurpose || '-',
            pic: result.permit?.pic?.fullName || '-',
            dataCenter: result.permit?.dataCenter?.replace('_', ' ') || '-',
            visitDate: result.permit?.visitDate || '-',
          }
        });
      } else {
        setError(result?.message || 'Invalid permit or OTP');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!verificationResult?.permit?.id) {
      setError('No permit to check in');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await checkIn({
        qrCodeData: qrCode,
        otpCode: otp,
        location: 'Main Entrance'
      });

      alert('Check-in successful!');
      setVerificationResult(null);
      setQrCode('');
      setOtp('');
      loadActiveVisitors(); // Refresh active visitors list
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async (visitor) => {
    if (!visitor.permitData?.id) {
      alert('Invalid permit data');
      return;
    }

    setProcessing(true);
    try {
      await checkOut(visitor.permitData.id, {
        checkedOutBy: user?.id,
        location: 'Main Entrance'
      });

      alert(`${visitor.name} has been checked out successfully!`);
      loadActiveVisitors(); // Refresh active visitors list
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-600">Access Control</h1>
        <p className="text-gray-500">Manage visitor check-in and check-out</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'scan', label: 'Check-in', icon: 'ri-qr-scan-2-line' },
          { id: 'active', label: 'Active Visitors', icon: 'ri-user-follow-line', count: activeVisitors.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'active') loadActiveVisitors();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-primary-600'
              }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${tab.count > 0 ? 'bg-success text-white' : 'bg-gray-300 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Check-in Tab */}
      {activeTab === 'scan' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scan Section */}
          <Card>
            <h3 className="font-bold text-dark-600 mb-6 flex items-center gap-2">
              <i className="ri-qr-scan-2-line text-primary-600"></i>
              Verify Visitor
            </h3>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            {!verificationResult ? (
              <div className="space-y-6">
                {/* QR Scanner Placeholder */}
                <div className="aspect-square max-w-xs mx-auto bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <i className="ri-qr-scan-2-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 text-center">Position QR code here</p>
                  <p className="text-xs text-gray-400 mt-1">or enter manually below</p>
                </div>

                <div className="text-center text-gray-400 text-sm">— OR —</div>

                <Input
                  label="Permit ID / QR Code"
                  placeholder="Enter permit ID (e.g., WP-2026-0001)"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  icon={<i className="ri-qr-code-line"></i>}
                />

                <Input
                  label="OTP Code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  icon={<i className="ri-lock-line"></i>}
                />

                <Button
                  className="w-full"
                  onClick={handleVerify}
                  icon={<i className="ri-shield-check-line"></i>}
                  disabled={processing}
                >
                  {processing ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Verification Success */}
                <div className="text-center p-6 bg-green-100 rounded-xl">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold text-success mb-1">Verified Successfully</h3>
                  <p className="text-sm text-gray-600">Visitor identity confirmed</p>
                </div>

                {/* Visitor Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-dark-600">{verificationResult.visitor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company:</span>
                    <span className="font-medium text-dark-600">{verificationResult.visitor.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Permit ID:</span>
                    <span className="font-medium text-primary-600">{verificationResult.visitor.permitId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Purpose:</span>
                    <span className="font-medium text-dark-600">{verificationResult.visitor.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PIC:</span>
                    <span className="font-medium text-dark-600">{verificationResult.visitor.pic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Center:</span>
                    <span className="font-medium text-dark-600">{verificationResult.visitor.dataCenter}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setVerificationResult(null);
                    setError(null);
                  }}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckIn}
                    icon={<i className="ri-login-box-line"></i>}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Complete Check-in'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
            <h3 className="font-bold text-dark-600 mb-4">Check-in Instructions</h3>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Ask visitor to show their QR code from email/app' },
                { step: 2, text: 'Scan the QR code or enter the permit ID manually' },
                { step: 3, text: 'Request the OTP code sent to visitor\'s phone/email' },
                { step: 4, text: 'Verify identity matches the permit information' },
                { step: 5, text: 'Issue temporary ID card after successful check-in' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {item.step}
                  </div>
                  <p className="text-gray-600 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Active Visitors Tab */}
      {activeTab === 'active' && (
        <div>
          {loadingVisitors ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : activeVisitors.length === 0 ? (
            <Card className="text-center py-12">
              <i className="ri-user-unfollow-line text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Visitors</h3>
              <p className="text-gray-400">All visitors have checked out</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeVisitors.map((visitor, index) => (
                <Card key={visitor.id || index} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-success"></div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-primary-500 flex items-center justify-center text-white font-bold">
                      {visitor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-600">{visitor.name}</p>
                      <p className="text-sm text-gray-500">{visitor.company}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-file-text-line text-primary-500"></i>
                      <span>{visitor.permitId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-time-line text-success"></i>
                      <span>Checked in at {visitor.checkInTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-map-pin-line text-warning"></i>
                      <span>{visitor.area}</span>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    icon={<i className="ri-logout-box-r-line"></i>}
                    onClick={() => handleCheckOut(visitor)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Check-out'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessControl;
