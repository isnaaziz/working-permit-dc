import React from 'react';
import plnLogo from '../assets/pln-logo.webp';

const DashboardOverview = () => {
    // Dummy data mirroring the likely content of the dashboard
    const stats = [
        { label: 'Total Permits', value: '12', icon: 'ri-file-list-3-line', color: 'text-primary' },
        { label: 'Pending Approval', value: '4', icon: 'ri-time-line', color: 'text-warning' },
        { label: 'Active Visitors', value: '2', icon: 'ri-user-follow-line', color: 'text-success' },
        { label: 'Rejected', value: '1', icon: 'ri-close-circle-line', color: 'text-danger' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src={plnLogo} alt="PLN Logo" className="h-12 w-auto object-contain" />
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
                        <p className="text-text-muted">Manage your permits, approvals, and facility access.</p>
                    </div>
                </div>
                <button className="btn btn-primary shadow-lg shadow-accent/20">
                    <i className="ri-add-line text-lg"></i>
                    <span>New Permit Application</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card p-6 flex items-start justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                        <div>
                            <div className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">{stat.label}</div>
                            <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                        </div>
                        <div className={`p-3 rounded-xl bg-body ${stat.color} bg-opacity-50 text-xl`}>
                            <i className={stat.icon}></i>
                        </div>
                        {/* Decorative Background Icon */}
                        <i className={`${stat.icon} absolute -bottom-4 -right-4 text-8xl opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform`}></i>
                    </div>
                ))}
            </div>

            {/* Main Content Card (Table) */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-info-bg text-info rounded-lg">
                            <i className="ri-file-list-3-line text-xl"></i>
                        </div>
                        <h3 className="card-title">Permit Activities</h3>
                    </div>

                    <div className="flex gap-2 bg-body p-1 rounded-lg border border-border">
                        <button className="px-4 py-1.5 text-sm font-medium bg-white text-primary shadow-sm rounded-md transition-all">
                            My Permits
                        </button>
                        <button className="px-4 py-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors">
                            Approvals
                        </button>
                        <button className="px-4 py-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors">
                            History
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-body text-xs uppercase font-semibold text-text-muted">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Permit No</th>
                                <th className="px-6 py-4">Visitor</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 rounded-tr-lg text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-divider">
                            {/* Dummy Row */}
                            <tr className="hover:bg-body/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-primary">PERMIT-2023-001</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">JD</div>
                                        <div>
                                            <div className="font-bold text-primary">John Doe</div>
                                            <div className="text-xs text-text-muted">Vendor Corp</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">Server Maintenance</td>
                                <td className="px-6 py-4">Jakarta DC 1</td>
                                <td className="px-6 py-4">Oct 24, 2023</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-bg text-success border border-success/20">
                                        APPROVED
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-body/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-primary">PERMIT-2023-002</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-warning text-white flex items-center justify-center text-xs font-bold">JS</div>
                                        <div>
                                            <div className="font-bold text-primary">Jane Smith</div>
                                            <div className="text-xs text-text-muted">ISP Provider</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">Fiber Installation</td>
                                <td className="px-6 py-4">Surabaya DC 1</td>
                                <td className="px-6 py-4">Oct 25, 2023</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning-bg text-warning border border-warning/20">
                                        PENDING
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-divider text-center">
                    <button className="text-sm font-medium text-accent hover:text-accent-hover flex items-center justify-center gap-1 mx-auto group">
                        View All Activities <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
