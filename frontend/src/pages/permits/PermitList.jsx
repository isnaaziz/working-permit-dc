import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePermits } from '../../hooks';

const PermitList = () => {
  const { user, isVisitor, isPIC } = useAuth();
  const { permits, loading, fetchAll, fetchByVisitor, fetchByPIC } = usePermits();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPermits();
  }, [user]);

  const loadPermits = async () => {
    try {
      if (isVisitor) {
        await fetchByVisitor(user.userId);
      } else if (isPIC) {
        await fetchByPIC(user.userId);
      } else {
        await fetchAll();
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

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.permitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.visitPurpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.dataCenter?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'PENDING_PIC', 'PENDING_MANAGER', 'APPROVED', 'ACTIVE', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">My Permits</h1>
          <p className="text-gray-500">Manage and track your working permit requests</p>
        </div>
        {isVisitor && (
          <Link to="/dashboard/permits/new">
            <Button icon={<i className="ri-add-line"></i>}>
              New Request
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search permits..."
              icon={<i className="ri-search-line"></i>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <i className="ri-loader-4-line text-4xl text-primary-600 animate-spin"></i>
            <p className="text-gray-500">Loading permits...</p>
          </div>
        </div>
      )}

      {/* Permits Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPermits.map((permit, index) => (
            <Card key={index} hover className="relative">
              <div className="flex items-start justify-between mb-4">
                <span className="text-lg font-bold text-primary-600">{permit.permitNumber}</span>
                {getStatusBadge(permit.status)}
              </div>
              
              <h3 className="font-semibold text-dark-600 mb-3">{permit.visitPurpose}</h3>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-line text-primary-500"></i>
                  <span>{permit.dataCenter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line text-primary-500"></i>
                  <span>{formatDate(permit.scheduledStartTime)} - {formatDate(permit.scheduledEndTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-user-line text-primary-500"></i>
                  <span>PIC: {permit.pic?.fullName || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Link to={`/dashboard/permits/${permit.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                {(permit.status === 'APPROVED' || permit.status === 'ACTIVE') && permit.qrCode && (
                  <Button variant="primary" size="sm" icon={<i className="ri-qr-code-line"></i>}>
                    QR
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredPermits.length === 0 && (
        <Card className="text-center py-12">
          <i className="ri-file-search-line text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No permits found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
          {isVisitor && (
            <Link to="/dashboard/permits/new">
              <Button>Create New Permit</Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  );
};

export default PermitList;
