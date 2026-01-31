import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePermits } from '../../hooks';

// Import role-based dashboards
import VisitorDashboard from '../../components/dashboard/VisitorDashboard';
import PICDashboard from '../../components/dashboard/PICDashboard';
import ManagerDashboard from '../../components/dashboard/ManagerDashboard';
import SecurityDashboard from '../../components/dashboard/SecurityDashboard';
import AdminDashboard from '../../components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, isVisitor, isPIC, isManager, isSecurity, isAdmin, isAdministrator, isAdministratorODC, isAdministratorInfra, isAdministratorNetwork } = useAuth();
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Common props for all dashboards
  const dashboardProps = {
    user,
    stats,
    permits,
    loading,
    formatDate,
    getStatusBadge,
  };

  // Render role-specific dashboard
  if (isVisitor) {
    return <VisitorDashboard {...dashboardProps} />;
  }

  if (isPIC) {
    return <PICDashboard {...dashboardProps} />;
  }

  if (isManager) {
    return <ManagerDashboard {...dashboardProps} />;
  }

  if (isSecurity) {
    return <SecurityDashboard {...dashboardProps} />;
  }

  if (isAdmin || isAdministrator || isAdministratorODC || isAdministratorInfra || isAdministratorNetwork) {
    return <AdminDashboard {...dashboardProps} />;
  }

  // Default fallback dashboard
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, {user?.fullName || 'User'}!</p>
        </div>
      </div>

      <Card className="text-center py-12">
        <i className="ri-dashboard-line text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Selamat datang di Data Center Working Permit System</p>
      </Card>
    </div>
  );
};

export default Dashboard;
