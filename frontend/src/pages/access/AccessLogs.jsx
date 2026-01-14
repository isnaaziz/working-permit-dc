import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useAccess } from '../../hooks';

const AccessLogs = () => {
  const { logs, loading, fetchLogs } = useAccess();
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    activeNow: 0,
    checkedOut: 0,
    deniedAccess: 0
  });

  // Load logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on date and search
  useEffect(() => {
    let filtered = [...logs];
    
    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp || log.createdAt);
        return logDate >= today;
      });
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp || log.createdAt);
        return logDate >= weekAgo;
      });
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp || log.createdAt);
        return logDate >= monthAgo;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        (log.visitor?.fullName || '').toLowerCase().includes(query) ||
        (log.permit?.permitNumber || '').toLowerCase().includes(query) ||
        (log.location || '').toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);

    // Calculate stats
    const checkIns = filtered.filter(l => l.accessType === 'CHECK_IN').length;
    const checkOuts = filtered.filter(l => l.accessType === 'CHECK_OUT').length;
    const denied = filtered.filter(l => l.accessType === 'DENIED').length;
    
    setStats({
      totalEntries: checkIns,
      activeNow: Math.max(0, checkIns - checkOuts),
      checkedOut: checkOuts,
      deniedAccess: denied
    });
  }, [logs, dateFilter, searchQuery]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'CHECK_IN': return { icon: 'ri-login-box-line', bgColor: 'bg-green-100', textColor: 'text-green-600', variant: 'success' };
      case 'CHECK_OUT': return { icon: 'ri-logout-box-line', bgColor: 'bg-red-100', textColor: 'text-red-600', variant: 'danger' };
      case 'DOOR_ACCESS': return { icon: 'ri-door-open-line', bgColor: 'bg-blue-100', textColor: 'text-blue-600', variant: 'primary' };
      case 'DOOR_EXIT': return { icon: 'ri-door-closed-line', bgColor: 'bg-amber-100', textColor: 'text-amber-600', variant: 'warning' };
      case 'DENIED': return { icon: 'ri-close-circle-line', bgColor: 'bg-red-100', textColor: 'text-red-600', variant: 'danger' };
      default: return { icon: 'ri-information-line', bgColor: 'bg-gray-100', textColor: 'text-gray-600', variant: 'gray' };
    }
  };

  const getLogLabel = (type) => {
    switch (type) {
      case 'CHECK_IN': return 'Check In';
      case 'CHECK_OUT': return 'Check Out';
      case 'DOOR_ACCESS': return 'Door Access';
      case 'DOOR_EXIT': return 'Door Exit';
      case 'DENIED': return 'Denied';
      default: return type;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { time: '-', date: '-' };
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Time', 'Date', 'Visitor', 'Permit ID', 'Type', 'Location'];
    const rows = filteredLogs.map(log => {
      const { time, date } = formatDateTime(log.timestamp || log.createdAt);
      return [
        time,
        date,
        log.visitor?.fullName || log.checkedInBy || '-',
        log.permit?.permitNumber || '-',
        getLogLabel(log.accessType),
        log.location || '-'
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-logs-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">Access Logs</h1>
          <p className="text-gray-500">Track all access activities in the data center</p>
        </div>
        <Button variant="outline" icon={<i className="ri-download-line"></i>} onClick={handleExport}>
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, permit ID..."
              icon={<i className="ri-search-line"></i>}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['today', 'week', 'month', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: stats.totalEntries, icon: 'ri-login-box-line', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
          { label: 'Active Now', value: stats.activeNow, icon: 'ri-user-follow-line', bgColor: 'bg-green-100', textColor: 'text-green-600' },
          { label: 'Checked Out', value: stats.checkedOut, icon: 'ri-logout-box-line', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
          { label: 'Denied Access', value: stats.deniedAccess, icon: 'ri-close-circle-line', bgColor: 'bg-red-100', textColor: 'text-red-600' },
        ].map((stat, index) => (
          <Card key={index} padding="sm" className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <i className={`${stat.icon} text-xl ${stat.textColor}`}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-600">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Logs Timeline */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-dark-600">Activity Timeline</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-file-list-3-line text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Access Logs</h3>
            <p className="text-gray-400">No access activities found for the selected period</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const { icon, bgColor, textColor, variant } = getLogIcon(log.accessType);
              const { time, date } = formatDateTime(log.timestamp || log.createdAt);
              return (
                <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${icon} ${textColor}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark-600">
                        {log.visitor?.fullName || log.checkedInBy || 'Unknown'}
                      </span>
                      <Badge variant={variant} size="sm">{getLogLabel(log.accessType)}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <i className="ri-file-text-line"></i>
                        {log.permit?.permitNumber || '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-map-pin-line"></i>
                        {log.location || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-dark-600">{time}</p>
                    <p className="text-gray-400">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AccessLogs;
