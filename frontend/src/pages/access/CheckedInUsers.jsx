import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../../components/ui';
import { accessService } from '../../services';

const CheckedInUsers = () => {
  const [checkedInUsers, setCheckedInUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalActive: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  // Load checked-in users
  const loadCheckedInUsers = async () => {
    try {
      const data = await accessService.getCheckedInVisitors();
      setCheckedInUsers(data || []);
    } catch (err) {
      console.error('Failed to load checked-in users:', err);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const data = await accessService.getStats();
      setStats({
        totalActive: data.activeVisitors || 0,
        todayCheckIns: data.todayCheckIns || 0,
        todayCheckOuts: data.todayCheckOuts || 0
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCheckedInUsers(), loadStats()]);
      setLoading(false);
    };
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadCheckedInUsers();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCheckedInUsers(), loadStats()]);
    setRefreshing(false);
  };

  // Handle check-out
  const handleCheckOut = async (permitId, visitorName) => {
    if (!window.confirm(`Apakah Anda yakin ingin check-out ${visitorName}?`)) {
      return;
    }

    try {
      const result = await accessService.scanCheckOut(permitId, 'Manual checkout from dashboard');
      if (result.success) {
        alert(`Check-out berhasil untuk ${visitorName}`);
        await loadCheckedInUsers();
        await loadStats();
      } else {
        alert(result.message || 'Check-out gagal');
      }
    } catch (err) {
      alert('Check-out gagal: ' + (err.message || 'Unknown error'));
    }
  };

  // Filter users based on search
  const filteredUsers = checkedInUsers.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.visitorName || '').toLowerCase().includes(query) ||
      (user.company || '').toLowerCase().includes(query) ||
      (user.permitNumber || '').toLowerCase().includes(query) ||
      (user.dataCenter || '').toLowerCase().includes(query)
    );
  });

  // Calculate time elapsed since check-in
  const getTimeElapsed = (checkInTime) => {
    if (!checkInTime) return '-';
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffMs = now - checkIn;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs} jam ${diffMins} menit`;
    }
    return `${diffMins} menit`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">
            <i className="ri-user-follow-line text-success mr-2"></i>
            Visitor Aktif
          </h1>
          <p className="text-gray-500">Daftar visitor yang sedang berada di Data Center</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            icon={<i className={`ri-refresh-line ${refreshing ? 'animate-spin' : ''}`}></i>}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link to="/dashboard/access">
            <Button icon={<i className="ri-qr-scan-2-line"></i>}>
              Scan Check-in
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
            <i className="ri-user-follow-line text-xl text-success"></i>
          </div>
          <div>
            <p className="text-2xl font-bold text-dark-600">{stats.totalActive}</p>
            <p className="text-xs text-gray-500">Visitor Aktif</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <i className="ri-login-box-line text-xl text-blue-600"></i>
          </div>
          <div>
            <p className="text-2xl font-bold text-dark-600">{stats.todayCheckIns}</p>
            <p className="text-xs text-gray-500">Check-in Hari Ini</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <i className="ri-logout-box-line text-xl text-amber-600"></i>
          </div>
          <div>
            <p className="text-2xl font-bold text-dark-600">{stats.todayCheckOuts}</p>
            <p className="text-xs text-gray-500">Check-out Hari Ini</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari visitor, perusahaan, atau permit..."
              icon={<i className="ri-search-line"></i>}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Checked-in Users List */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-dark-600">
            <i className="ri-user-follow-line text-success mr-2"></i>
            Visitor Aktif di Data Center
            <Badge variant="success" className="ml-2">{filteredUsers.length}</Badge>
          </h3>
          <p className="text-sm text-gray-500">
            Update otomatis setiap 30 detik
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-user-unfollow-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak Ada Visitor Aktif</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? 'Tidak ada visitor yang cocok dengan pencarian' 
                : 'Belum ada visitor yang check-in saat ini'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div key={user.permitId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white font-bold text-lg">
                      {user.visitorName?.charAt(0) || 'V'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark-600">{user.visitorName}</p>
                        <Badge variant="success" size="sm" dot>Aktif</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{user.company || '-'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>
                          <i className="ri-file-text-line mr-1"></i>
                          {user.permitNumber}
                        </span>
                        <span>
                          <i className="ri-building-line mr-1"></i>
                          {user.dataCenter?.replace('_', ' ') || '-'}
                        </span>
                        <span>
                          <i className="ri-briefcase-line mr-1"></i>
                          {user.purpose || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Check-in Time & Actions */}
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-dark-600">
                        <i className="ri-time-line mr-1"></i>
                        {formatTime(user.checkInTime)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(user.checkInTime)}</p>
                      <p className="text-xs text-success mt-1">
                        <i className="ri-timer-line mr-1"></i>
                        {getTimeElapsed(user.checkInTime)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCheckOut(user.permitId, user.visitorName)}
                      className="text-danger border-danger hover:bg-danger hover:text-white"
                    >
                      <i className="ri-logout-box-line mr-1"></i>
                      Check-out
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to="/dashboard/logs" className="flex-1">
          <Card hover className="p-4 text-center cursor-pointer">
            <i className="ri-file-list-3-line text-3xl text-primary-600 mb-2"></i>
            <p className="font-medium text-dark-600">Lihat Access Logs</p>
            <p className="text-sm text-gray-500">Riwayat semua akses</p>
          </Card>
        </Link>
        <Link to="/dashboard/access" className="flex-1">
          <Card hover className="p-4 text-center cursor-pointer">
            <i className="ri-qr-scan-2-line text-3xl text-success mb-2"></i>
            <p className="font-medium text-dark-600">Scan Check-in</p>
            <p className="text-sm text-gray-500">Proses check-in baru</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default CheckedInUsers;
