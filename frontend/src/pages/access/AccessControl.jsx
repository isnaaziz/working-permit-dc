import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from '../../hooks';
import { permitService, accessService } from '../../services';
import QrScanner from 'react-qr-barcode-scanner';

const AccessControl = () => {
  const { user } = useAuth();
  const { verify, checkIn, checkOut, fetchLogs, loading: accessLoading } = useAccess();
  const scanInputRef = useRef(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const [activeTab, setActiveTab] = useState('scan');
  const [scanMode, setScanMode] = useState('camera'); // 'camera', 'barcode' or 'manual'
  const [scanInput, setScanInput] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scannerStatus, setScannerStatus] = useState({ status: 'ONLINE', scannerType: 'BARCODE_QR' });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Initialize camera scanner
  useEffect(() => {
    if (scanMode === 'camera' && activeTab === 'scan' && !verificationResult) {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [scanMode, activeTab, verificationResult]);

  const startCameraScanner = async () => {
    try {
      setCameraError(null);
      
      // Wait for DOM element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const scannerElement = document.getElementById('qr-reader');
      if (!scannerElement) {
        console.error('Scanner element not found');
        return;
      }

      // Stop existing scanner if any
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }

      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // On successful scan
          console.log('Scanned:', decodedText);
          await stopCameraScanner();
          await processBarcodeOTP(decodedText);
        },
        (errorMessage) => {
          // Scan error - ignore, it's normal when no code is visible
        }
      );
      
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Gagal mengakses kamera. Pastikan izin kamera diberikan.');
      setCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        // Ignore errors when stopping
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  // Focus on scan input when in barcode mode
  useEffect(() => {
    if (scanMode === 'barcode' && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [scanMode, activeTab]);

  // Load scanner status
  useEffect(() => {
    const loadScannerStatus = async () => {
      try {
        const status = await accessService.getScannerStatus();
        setScannerStatus(status);
      } catch (err) {
        console.error('Failed to load scanner status:', err);
      }
    };
    loadScannerStatus();
  }, []);

  // Load active visitors (checked-in but not checked-out)
  const loadActiveVisitors = async () => {
    console.log('🔄 Loading active visitors...');
    setLoadingVisitors(true);
    try {
      // Get permits with ACTIVE status (checked in)
      const permits = await permitService.getByStatus('ACTIVE');
      console.log('✅ Active permits loaded:', permits);
      const visitors = permits.map(permit => ({
        id: permit.id,
        name: permit.visitor?.fullName || 'Unknown',
        company: permit.visitor?.company || '-',
        permitId: permit.permitNumber,
        checkInTime: permit.actualCheckInTime ? new Date(permit.actualCheckInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        area: permit.dataCenter?.replace('_', ' ') || permit.dataCenter,
        permitData: permit
      }));
      console.log('👥 Mapped visitors:', visitors);
      setActiveVisitors(visitors);
    } catch (err) {
      console.error('❌ Failed to load active visitors:', err);
    } finally {
      setLoadingVisitors(false);
    }
  };

  useEffect(() => {
    loadActiveVisitors();
  }, []);

  // Handle barcode scan (when scanner sends data ending with Enter key)
  const handleBarcodeScan = async (e) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      e.preventDefault();
      await processBarcodeOTP(scanInput.trim());
    }
  };

  // Process scanned barcode/OTP code
  const processBarcodeOTP = async (scannedCode) => {
    setError(null);
    setProcessing(true);

    try {
      const result = await accessService.scanOTP(scannedCode);

      if (result && result.success) {
        setVerificationResult({
          success: true,
          permitId: result.permitId,
          visitor: {
            name: result.visitorName || 'Unknown',
            company: result.company || '-',
            permitId: result.permitNumber,
            purpose: '-',
            pic: '-',
            dataCenter: result.dataCenter || '-',
          }
        });
        setScanInput('');
      } else {
        setError(result?.message || 'Kode OTP tidak valid');
        setScanInput('');
        // Re-focus for next scan
        if (scanInputRef.current) {
          scanInputRef.current.focus();
        }
      }
    } catch (err) {
      setError(err.message || 'Verifikasi gagal');
      setScanInput('');
    } finally {
      setProcessing(false);
    }
  };

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
    if (!verificationResult?.permitId && !verificationResult?.permit?.id) {
      setError('No permit to check in');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Use scan check-in if we have permitId from barcode scan
      if (verificationResult?.permitId) {
        console.log('🔍 Performing scan check-in for permitId:', verificationResult.permitId);
        const result = await accessService.scanCheckIn(verificationResult.permitId, '');
        console.log('✅ Check-in result:', result);
        if (result.success) {
          alert(`Check-in berhasil!\n\nVisitor: ${result.visitorName}\nPermit: ${result.permitNumber}`);
          setVerificationResult(null);
          setScanInput('');
          setQrCode('');
          setOtp('');
          console.log('🔄 Reloading active visitors after check-in...');
          await loadActiveVisitors();
          // Re-focus for next scan
          if (scanInputRef.current) {
            scanInputRef.current.focus();
          }
        } else {
          setError(result.message || 'Check-in gagal');
        }
      } else {
        // Fallback to original check-in
        await checkIn({
          qrCodeData: qrCode,
          otpCode: otp,
          location: 'Main Entrance'
        });
        alert('Check-in successful!');
        setVerificationResult(null);
        setQrCode('');
        setOtp('');
        loadActiveVisitors();
      }
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-dark-600 flex items-center gap-2">
                <i className="ri-barcode-box-line text-primary-600"></i>
                Scan Barcode OTP
              </h3>
              {/* Scanner Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                scannerStatus.status === 'ONLINE' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  scannerStatus.status === 'ONLINE' ? 'bg-success' : 'bg-danger'
                }`}></div>
                Scanner {scannerStatus.status === 'ONLINE' ? 'Aktif' : 'Offline'}
              </div>
            </div>

            {/* Scan Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setScanMode('camera')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'camera'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="ri-camera-line"></i>
                Kamera
              </button>
              <button
                onClick={() => setScanMode('barcode')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'barcode'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="ri-barcode-line"></i>
                Scanner
              </button>
              <button
                onClick={() => setScanMode('manual')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'manual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="ri-keyboard-line"></i>
                Input Manual
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            {!verificationResult ? (
              <div className="space-y-6">
                {scanMode === 'camera' ? (
                  // Camera Scan Mode
                  <>
                    <div className="relative">
                      {/* Camera Error */}
                      {cameraError && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                          <i className="ri-error-warning-line mr-2"></i>
                          {cameraError}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="ml-4"
                            onClick={startCameraScanner}
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      )}

                      {/* Camera View */}
                      <div className="relative rounded-2xl overflow-hidden bg-black">
                        <div 
                          id="qr-reader" 
                          className="w-full"
                          style={{ minHeight: '300px' }}
                        ></div>
                        
                        {!cameraActive && !cameraError && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                            <i className="ri-loader-4-line animate-spin text-4xl text-white mb-4"></i>
                            <p className="text-white">Mengaktifkan kamera...</p>
                          </div>
                        )}
                      </div>

                      {/* Camera indicator */}
                      {cameraActive && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-danger text-white px-3 py-1 rounded-full text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          REC - Scanning...
                        </div>
                      )}
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <i className="ri-camera-line text-primary-500 text-xl"></i>
                        <div>
                          <p className="text-sm text-primary-700 font-medium">Cara Scan dengan Kamera:</p>
                          <ol className="text-xs text-primary-600 mt-1 list-decimal list-inside space-y-1">
                            <li>Izinkan akses kamera saat diminta</li>
                            <li>Arahkan kamera ke barcode/QR OTP dari email visitor</li>
                            <li>Kode akan otomatis terbaca</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Manual OTP input as fallback */}
                    <div className="text-center text-gray-400 text-sm">— atau ketik kode OTP —</div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Masukkan 6 digit OTP..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        maxLength={6}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg tracking-widest text-center"
                      />
                      <Button
                        onClick={() => scanInput && processBarcodeOTP(scanInput)}
                        disabled={processing || !scanInput.trim()}
                      >
                        {processing ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-checkbox-circle-line"></i>
                        )}
                      </Button>
                    </div>
                  </>
                ) : scanMode === 'barcode' ? (
                  // Barcode Scan Mode
                  <>
                    <div className="aspect-video max-w-md mx-auto bg-linear-to-br from-primary-50 to-secondary-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-primary-300 relative">
                      <i className="ri-barcode-box-line text-6xl text-primary-400 mb-4"></i>
                      <p className="text-primary-600 font-medium text-center">Arahkan Scanner ke Barcode OTP</p>
                      <p className="text-xs text-gray-500 mt-2">Kode akan otomatis terbaca</p>
                      
                      {/* Hidden input for barcode scanner */}
                      <input
                        ref={scanInputRef}
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyDown={handleBarcodeScan}
                        className="absolute inset-0 opacity-0 cursor-default"
                        autoFocus
                        placeholder="Scan barcode..."
                      />
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <i className="ri-information-line text-primary-500 text-xl"></i>
                        <div>
                          <p className="text-sm text-primary-700 font-medium">Cara Scan Barcode:</p>
                          <ol className="text-xs text-primary-600 mt-1 list-decimal list-inside space-y-1">
                            <li>Klik area scan di atas untuk mengaktifkan</li>
                            <li>Arahkan scanner barcode ke kode OTP dari email visitor</li>
                            <li>Data akan otomatis terbaca dan diverifikasi</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Manual OTP input as fallback */}
                    <div className="text-center text-gray-400 text-sm">— atau ketik kode OTP —</div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Masukkan 6 digit OTP..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        maxLength={6}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-lg tracking-widest text-center"
                      />
                      <Button
                        onClick={() => scanInput && processBarcodeOTP(scanInput)}
                        disabled={processing || !scanInput.trim()}
                      >
                        {processing ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-checkbox-circle-line"></i>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  // Manual Input Mode (Original)
                  <>
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
                  </>
                )}
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
          <Card className="bg-linear-to-br from-primary-50 to-secondary-50">
            <h3 className="font-bold text-dark-600 mb-4">Check-in Instructions</h3>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Minta visitor menunjukkan email dengan barcode OTP' },
                { step: 2, text: 'Scan barcode menggunakan scanner atau ketik kode OTP 6 digit' },
                { step: 3, text: 'Verifikasi data visitor yang tampil di layar' },
                { step: 4, text: 'Klik tombol "Complete Check-in" jika data sesuai' },
                { step: 5, text: 'Berikan ID card sementara kepada visitor' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
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
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-success to-primary-500 flex items-center justify-center text-white font-bold">
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
