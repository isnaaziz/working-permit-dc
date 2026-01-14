import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

import Footer from './Footer';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-body overflow-hidden">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-body p-4 md:p-8">
                    <Outlet />
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
