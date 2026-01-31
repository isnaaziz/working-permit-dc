import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../../components/ui';

// Dashboard untuk Security - fokus pada scan barcode OTP untuk check-in/out
const SecurityDashboard = ({ user, stats, permits, loading, formatDate, getStatusBadge }) => {
  const [scanInput, setScanInput] = useState('');
  const [scannerStatus, setScannerStatus] = useState({ status: 'ONLINE', lastSync: new Date() });
  const [scanResult, setScanResult] = useState(null);
  
  // Filter permits aktif dan yang siap check-in
  const activeVisitors = permits.filter(p => p.status === 'ACTIVE');
  const readyForCheckIn = permits.filter(p => p.status === 'APPROVED');
  
  // Today's scheduled visits
  const todaySchedule = permits.filter(p => {
    const today = new Date().toDateString();
    const startDate = new Date(p.scheduledStartTime).toDateString();
    return startDate === today && ['APPROVED', 'ACTIVE'].includes(p.status);
  });

  // Simulate scanner status
  useEffect(() => {
    const interval = setInterval(() => {
      setScannerStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (scanInput.trim()) {
      // Verify OTP code
      setScanResult({ loading: true });
      
      try {
        // In production, this would call the API to verify OTP
        // For now, simulate verification
        const permit = permits.find(p => 
          p.otpCode === scanInput.trim() || 
          p.permitNumber === scanInput.trim()
        );
        
        if (permit) {
          setScanResult({
            success: true,
            permit: permit,
            message: 'Kode OTP Valid!'
          });
        } else {
          setScanResult({
            success: false,
            message: 'Kode OTP tidak ditemukan atau sudah kadaluarsa'
          });
        }
      } catch (error) {
        setScanResult({
          success: false,
          message: 'Gagal memverifikasi: ' + error.message
        });
      }
    }
  };

  const handleCheckIn = (permitId) => {
    window.location.href = `/dashboard/access?checkin=${permitId}`;
  };

  const clearScanResult = () => {
    setScanResult(null);
    setScanInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header with Scanner Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard Security</h1>
          <p className="text-text-muted">Scan barcode OTP untuk verifikasi check-in/out visitor.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Scanner Status Indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            scannerStatus.status === 'ONLINE' 
              ? 'bg-success-bg text-success' 
              : 'bg-danger-bg text-danger'
          }`}>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              scannerStatus.status === 'ONLINE' ? 'bg-success' : 'bg-danger'
            }`}></div>
            <span className="font-medium text-sm">
              <i className="ri-barcode-line mr-1"></i>
              Scanner {scannerStatus.status === 'ONLINE' ? 'Aktif' : 'Offline'}
            </span>
          </div>
          <Link to="/dashboard/access">
            <Button icon={<i className="ri-qr-scan-2-line"></i>}>
              Mode Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Scan OTP Box */}
      <Card className="text-white" style={{ background: 'linear-gradient(to right, #0077b6, #0ea5e9)' }}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <i className="ri-barcode-box-line text-4xl"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-xl mb-2">
              <i className="ri-qr-scan-2-line mr-2"></i>
              Scan Barcode OTP
            </h3>
            <p className="opacity-90 mb-4">
              Scan barcode dari email visitor atau masukkan kode OTP 6 digit secara manual
            </p>
            <form onSubmit={handleScanSubmit} className="flex gap-3 max-w-md">
              <input
                type="text"
                placeholder="Masukkan kode OTP (6 digit)..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                maxLength={6}
                style={{ color: '#1e2d40', backgroundColor: 'white' }}
                className="flex-1 px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white font-mono text-lg tracking-widest shadow-lg border-0"
              />
              <button 
                type="submit" 
                className="px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-1 transition-colors"
                style={{ backgroundColor: 'white', color: '#0077b6' }}
              >
                <i className="ri-checkbox-circle-line"></i>
                Verifikasi
              </button>
            </form>
          </div>
        </div>
      </Card>

      {/* Scan Result Modal */}
      {scanResult && (
        <Card className={`border-2 ${scanResult.success ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                scanResult.success ? 'bg-success' : 'bg-danger'
              }`}>
                <i className={`text-3xl text-white ${
                  scanResult.success ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'
                }`}></i>
              </div>
              <div>
                <h3 className={`font-bold text-lg ${scanResult.success ? 'text-success' : 'text-danger'}`}>
                  {scanResult.message}
                </h3>
                {scanResult.success && scanResult.permit && (
                  <div className="mt-2">
                    <p className="text-primary">
                      <strong>Visitor:</strong> {scanResult.permit.visitor?.fullName}
                    </p>
                    <p className="text-text-muted">
                      <strong>Permit:</strong> {scanResult.permit.permitNumber}
                    </p>
                    <p className="text-text-muted">
                      <strong>Perusahaan:</strong> {scanResult.permit.visitor?.company}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {scanResult.success && scanResult.permit && (
                <Button onClick={() => handleCheckIn(scanResult.permit.id)}>
                  <i className="ri-login-box-line mr-1"></i>
                  Check-in
                </Button>
              )}
              <Button variant="outline" onClick={clearScanResult}>
                <i className="ri-close-line mr-1"></i>
                Tutup
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Visitor Aktif</p>
              <p className="text-4xl font-bold text-primary">{activeVisitors.length}</p>
              <p className="text-xs text-text-muted">Sedang di Data Center</p>
            </div>
            <div className="p-3 rounded-xl bg-success-bg text-success">
              <i className="ri-user-follow-line text-2xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Siap Check-in</p>
              <p className="text-4xl font-bold text-primary">{readyForCheckIn.length}</p>
              <p className="text-xs text-text-muted">Permit disetujui</p>
            </div>
            <div className="p-3 rounded-xl bg-info-bg text-info">
              <i className="ri-login-box-line text-2xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Jadwal Hari Ini</p>
              <p className="text-4xl font-bold text-primary">{todaySchedule.length}</p>
              <p className="text-xs text-text-muted">Kunjungan terjadwal</p>
            </div>
            <div className="p-3 rounded-xl bg-body text-accent">
              <i className="ri-calendar-check-line text-2xl"></i>
            </div>
          </div>
        </Card>
        <Card hover className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Check-in Hari Ini</p>
              <p className="text-4xl font-bold text-primary">
                {permits.filter(p => {
                  if (!p.actualCheckInTime) return false;
                  const today = new Date().toDateString();
                  return new Date(p.actualCheckInTime).toDateString() === today;
                }).length}
              </p>
              <p className="text-xs text-text-muted">Total check-in</p>
            </div>
            <div className="p-3 rounded-xl bg-warning-bg text-warning">
              <i className="ri-user-add-line text-2xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Visitors */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              <i className="ri-user-follow-line text-success mr-2"></i>
              Visitor Aktif di Data Center
            </h3>
            <Link to="/dashboard/logs">
              <Button variant="ghost" size="sm">Lihat Log</Button>
            </Link>
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
                <div key={permit.id} className="p-4 bg-success-bg border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white font-bold text-lg">
                        {permit.visitor?.fullName?.charAt(0) || 'V'}
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{permit.visitor?.fullName}</p>
                        <p className="text-sm text-text-muted">{permit.visitor?.company}</p>
                        <p className="text-xs text-text-muted">
                          <i className="ri-building-line mr-1"></i>{permit.dataCenter}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" dot>Aktif</Badge>
                      <p className="text-xs text-text-muted mt-1">
                        Check-in: {permit.actualCheckInTime ? new Date(permit.actualCheckInTime).toLocaleTimeString('id-ID') : '-'}
                      </p>
                      <Link to={`/dashboard/access?checkout=${permit.id}`}>
                        <Button size="sm" variant="outline" className="mt-2">
                          <i className="ri-logout-box-line mr-1"></i>Check-out
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Ready for Check-in */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">
              <i className="ri-login-box-line text-info mr-2"></i>
              Siap Check-in
            </h3>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-600"></i>
            </div>
          ) : readyForCheckIn.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-checkbox-circle-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">Tidak ada visitor yang siap check-in</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readyForCheckIn.slice(0, 5).map((permit) => (
                <div key={permit.id} className="p-4 bg-info-bg border border-info/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">{permit.visitor?.fullName}</p>
                      <p className="text-sm text-text-muted">{permit.permitNumber}</p>
                      <p className="text-xs text-text-muted">
                        Jadwal: {formatDate(permit.scheduledStartTime)}
                      </p>
                    </div>
                    <Link to={`/dashboard/access?checkin=${permit.id}`}>
                      <Button size="sm">
                        <i className="ri-qr-scan-line mr-1"></i>Check-in
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Camera Sync Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              scannerStatus.status === 'ONLINE' ? 'bg-success-bg' : 'bg-danger-bg'
            }`}>
              <i className={`ri-barcode-box-line text-2xl ${
                scannerStatus.status === 'ONLINE' ? 'text-success' : 'text-danger'
              }`}></i>
            </div>
            <div>
              <h3 className="font-bold text-primary">Status Barcode Scanner</h3>
              <p className="text-sm text-text-muted">
                Status: <span className={scannerStatus.status === 'ONLINE' ? 'text-success' : 'text-danger'}>
                  {scannerStatus.status === 'ONLINE' ? 'Terhubung & Siap Scan' : 'Terputus'}
                </span>
              </p>
              <p className="text-xs text-text-muted">
                Terakhir sync: {scannerStatus.lastSync.toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setScannerStatus(prev => ({ ...prev, lastSync: new Date() }))}>
              <i className="ri-refresh-line mr-1"></i>Refresh
            </Button>
            <Link to="/dashboard/access">
              <Button size="sm">
                <i className="ri-qr-scan-line mr-1"></i>Mulai Scan
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="bg-info-bg border border-info/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center shrink-0">
            <i className="ri-information-line text-white text-xl"></i>
          </div>
          <div>
            <h4 className="font-semibold text-primary">Cara Scan Barcode OTP</h4>
            <ol className="mt-2 text-sm text-text-muted list-decimal list-inside space-y-1">
              <li>Minta visitor menunjukkan email yang berisi barcode OTP</li>
              <li>Arahkan scanner ke barcode atau masukkan kode OTP 6 digit secara manual</li>
              <li>Sistem akan memverifikasi kode dan menampilkan data visitor</li>
              <li>Jika valid, klik tombol "Check-in" untuk mencatat kehadiran</li>
              <li>Untuk check-out, scan ulang barcode atau gunakan menu "Check-out" di daftar visitor aktif</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
