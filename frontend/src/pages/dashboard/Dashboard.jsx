import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePermits } from '../../hooks';

const Dashboard = () => {
  const { user, isVisitor, isPIC, isManager, isSecurity } = useAuth();
  const { permits, loading, fetchAll, fetchByVisitor, fetchByPIC } = usePermits();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadPermits();
  }, [user]);

  const loadPermits = async () => {
    try {
      let data;
      if (isVisitor) {
        data = await fetchByVisitor(user.userId);
      } else if (isPIC) {
        data = await fetchByPIC(user.userId);
      } else {
        data = await fetchAll();
      }
      
      // Calculate stats
      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(p => ['PENDING_PIC', 'PENDING_MANAGER'].includes(p.status)).length,
          active: data.filter(p => p.status === 'ACTIVE').length,
          rejected: data.filter(p => p.status === 'REJECTED').length,
        });
      }
    } catch (error) {
      console.error('Error loading permits:', error);
    }
  };

  const statsData = [
    { label: 'Total Permits', value: stats.total.toString(), icon: 'ri-file-list-3-line', color: 'primary', change: `${permits.length} total` },
    { label: 'Pending Approval', value: stats.pending.toString(), icon: 'ri-time-line', color: 'warning', change: 'Awaiting review' },
    { label: 'Active Permits', value: stats.active.toString(), icon: 'ri-user-follow-line', color: 'success', change: 'Currently active' },
    { label: 'Rejected', value: stats.rejected.toString(), icon: 'ri-close-circle-line', color: 'danger', change: 'This period' },
  ];

  const getStatusBadge = (status) => {
    const config = {
      PENDING_PIC: { variant: 'warning', label: 'Pending PIC' },
      PENDING_MANAGER: { variant: 'info', label: 'Pending Manager' },
      APPROVED: { variant: 'success', label: 'Approved' },
      ACTIVE: { variant: 'success', label: 'Active' },
      REJECTED: { variant: 'danger', label: 'Rejected' },
      EXPIRED: { variant: 'gray', label: 'Expired' },
      CANCELLED: { variant: 'gray', label: 'Cancelled' },
      COMPLETED: { variant: 'primary', label: 'Completed' },
    };
    const cfg = config[status] || { variant: 'gray', label: status };
    return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
  };

  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    warning: 'bg-amber-100 text-amber-600',
    success: 'bg-green-100 text-green-600',
    danger: 'bg-red-100 text-red-600',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get recent 5 permits
  const recentPermits = permits.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, {user?.fullName || 'User'}! Here's what's happening with your permits.</p>
        </div>
        {isVisitor && (
          <Link to="/dashboard/permits/new">
            <Button icon={<i className="ri-add-line"></i>}>
              New Permit Request
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} hover className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-dark-600 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${colorMap[stat.color]} flex items-center justify-center`}>
                <i className={`${stat.icon} text-2xl`}></i>
              </div>
            </div>
            {/* Decorative Icon */}
            <i className={`${stat.icon} absolute -bottom-4 -right-4 text-8xl opacity-5`}></i>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'ri-qr-scan-2-line', label: 'Scan QR', path: '/dashboard/access', color: 'bg-primary-100 text-primary-600', show: isSecurity },
          { icon: 'ri-check-double-line', label: 'Approvals', path: '/dashboard/approvals', color: 'bg-green-100 text-green-600', show: isPIC || isManager },
          { icon: 'ri-file-text-line', label: 'Access Logs', path: '/dashboard/logs', color: 'bg-secondary-100 text-secondary-600', show: true },
          { icon: 'ri-user-settings-line', label: 'Profile', path: '/dashboard/profile', color: 'bg-accent-100 text-accent', show: true },
        ].filter(a => a.show).map((action, index) => (
          <Link key={index} to={action.path}>
            <Card hover className="text-center py-6 group">
              <div className={`w-14 h-14 mx-auto rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <i className={`${action.icon} text-2xl`}></i>
              </div>
              <span className="font-medium text-dark-600">{action.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Permits Table */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <i className="ri-file-list-3-line text-primary-600 text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-dark-600">Recent Permits</h3>
              <p className="text-sm text-gray-500">Your latest permit activities</p>
            </div>
          </div>
          <Link to="/dashboard/permits">
            <Button variant="ghost" size="sm" icon={<i className="ri-arrow-right-line"></i>} iconPosition="right">
              View All
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Permit ID</th>
                <th className="px-6 py-4 text-left font-semibold">Visitor</th>
                <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <i className="ri-loader-4-line text-3xl text-primary-600 animate-spin"></i>
                      <p className="text-gray-500">Loading permits...</p>
                    </div>
                  </td>
                </tr>
              ) : recentPermits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <i className="ri-file-list-3-line text-4xl text-gray-300"></i>
                      <p className="text-gray-500">No permits found</p>
                      {isVisitor && (
                        <Link to="/dashboard/permits/new">
                          <Button size="sm">Create New Permit</Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                recentPermits.map((permit, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary-600">{permit.permitNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                          {permit.visitor?.fullName?.split(' ').map(n => n[0]).join('') || 'V'}
                        </div>
                        <div>
                          <div className="font-medium text-dark-600">{permit.visitor?.fullName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{permit.visitor?.company || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{permit.visitPurpose}</td>
                    <td className="px-6 py-4 text-gray-600">{permit.dataCenter}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(permit.scheduledStartTime)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(permit.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link to={`/dashboard/permits/${permit.id}`}>
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <i className="ri-eye-line"></i>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
