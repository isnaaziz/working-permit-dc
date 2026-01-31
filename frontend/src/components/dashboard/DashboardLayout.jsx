import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks';

const DashboardSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isVisitor, isPIC, isManager, isSecurity, isAdmin, isAdministrator, isAdministratorODC, isAdministratorInfra, isAdministratorNetwork } = useAuth();

  // Build menu items based on user role
  const getMenuItems = () => {
    const items = [];
    
    // Main Menu - All users
    const mainMenu = {
      title: 'Main Menu',
      items: [
        { name: 'Dashboard', icon: 'ri-dashboard-line', path: '/dashboard' },
        { name: 'Mutasi Barang', icon: 'ri-exchange-line', path: '/dashboard/mutasi-barang/list' },
      ]
    };
    
    // Visitor can see their permits and create new
    if (isVisitor || isAdmin || isAdministrator) {
      mainMenu.items.push(
        { name: 'My Permits', icon: 'ri-file-list-3-line', path: '/dashboard/permits' },
        { name: 'New Request', icon: 'ri-add-circle-line', path: '/dashboard/permits/new' }
      );
    }
    
    // PIC/Manager/Administrator can see permits they manage
    if (isPIC || isManager || isAdministratorODC || isAdministratorInfra || isAdministratorNetwork) {
      mainMenu.items.push(
        { name: 'Permits', icon: 'ri-file-list-3-line', path: '/dashboard/permits' }
      );
    }
    
    items.push(mainMenu);
    
    // Approval Menu - Only PIC, Manager, Admin, and Administrators
    if (isPIC || isManager || isAdmin || isAdministrator) {
      items.push({
        title: 'Approval',
        items: [
          { name: 'Pending Approvals', icon: 'ri-time-line', path: '/dashboard/approvals' },
          { name: 'Approval History', icon: 'ri-history-line', path: '/dashboard/approvals/history' },
        ]
      });
    }
    
    // Access Control - Only Security, Admin
    if (isSecurity || isAdmin || isAdministrator) {
      items.push({
        title: 'Access Control',
        items: [
          { name: 'Check-in/Out', icon: 'ri-qr-scan-2-line', path: '/dashboard/access' },
          { name: 'Visitor Aktif', icon: 'ri-user-follow-line', path: '/dashboard/checked-in' },
          { name: 'Access Logs', icon: 'ri-file-text-line', path: '/dashboard/logs' },
        ]
      });
    }
    
    // Access Logs for Manager (read-only)
    if (isManager && !isAdmin && !isSecurity) {
      items.push({
        title: 'Reports',
        items: [
          { name: 'Visitor Aktif', icon: 'ri-user-follow-line', path: '/dashboard/checked-in' },
          { name: 'Access Logs', icon: 'ri-file-text-line', path: '/dashboard/logs' },
        ]
      });
    }
    
    // Settings - All users
    items.push({
      title: 'Settings',
      items: [
        { name: 'Profile', icon: 'ri-user-settings-line', path: '/dashboard/profile' },
        { name: 'Notifications', icon: 'ri-notification-3-line', path: '/dashboard/notifications' },
      ]
    });
    
    return items;
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get role display name
  const getRoleDisplay = () => {
    const role = user?.role || user?.roles?.[0] || 'USER';
    const roleDisplayMap = {
      'VISITOR': 'Visitor',
      'PIC': 'PIC',
      'MANAGER': 'Manager',
      'SECURITY': 'Security',
      'ADMIN': 'Admin',
      'ADMINISTRATOR_ODC': 'Admin ODC',
      'ADMINISTRATOR_INFRA': 'Admin INFRA',
      'ADMINISTRATOR_NETWORK': 'Admin Network',
    };
    return roleDisplayMap[role] || role.charAt(0) + role.slice(1).toLowerCase();
  };

  // Get team display name
  const getTeamDisplay = () => {
    const teamMap = {
      'TIM_ODC': 'Tim ODC',
      'TIM_INFRA': 'Tim INFRA',
      'TIM_NETWORK': 'Tim Network',
      'TIM_SECURITY': 'Tim Security',
    };
    return user?.team ? teamMap[user.team] || user.team : null;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-dark-600 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-500">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <i className="ri-server-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold">
              DC<span className="text-primary-400">Permit</span>
            </span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={onClose}>
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive(item.path) 
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                          : 'text-gray-400 hover:bg-dark-500 hover:text-white'}
                      `}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-dark-500">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-500 mb-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{user?.fullName || 'User'}</div>
              <div className="text-xs text-gray-400 truncate">{getRoleDisplay()}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <i className="ri-logout-box-r-line"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const DashboardHeader = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { unreadCount, fetchUnread } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  
  useEffect(() => {
    fetchUnread();
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 text-gray-500 hover:text-primary-600 transition-colors"
          onClick={onMenuClick}
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2.5 w-80">
          <i className="ri-search-line text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search permits, approvals..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-600 placeholder-gray-400"
          />
          <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="ri-notification-3-line text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-danger text-white text-xs font-bold px-1.5 rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-dark-600">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <i className="ri-file-check-line text-primary-600"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-dark-600 font-medium">Permit Approved</p>
                        <p className="text-xs text-gray-500">Your permit #12345 has been approved</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <Link to="/dashboard/notifications" className="text-sm text-primary-600 font-medium hover:underline">
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
            {getUserInitials()}
          </div>
          <i className="ri-arrow-down-s-line text-gray-400 hidden md:block"></i>
        </button>
      </div>
    </header>
  );
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
