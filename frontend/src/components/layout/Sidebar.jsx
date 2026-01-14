import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/', icon: 'ri-dashboard-line', label: 'Dashboard' },
        { path: '/permits', icon: 'ri-file-list-3-line', label: 'My Permits' },
        { path: '/approvals', icon: 'ri-check-double-line', label: 'Approvals' },
        { path: '/logs', icon: 'ri-history-line', label: 'Access Logs' },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Brand */}
                <div className="flex items-center gap-3 p-6 h-[72px] border-b border-gray-800">
                    <i className="ri-shield-check-fill text-2xl text-accent"></i>
                    <span className="text-xl font-bold tracking-tight">DC Access</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive(item.path)
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <i className={`${item.icon} text-lg`}></i>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-800">
                    <button className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-danger hover:bg-gray-800 rounded-md transition-colors">
                        <i className="ri-logout-box-r-line text-lg"></i>
                        Secure Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
