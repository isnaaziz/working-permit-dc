import React from 'react';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-6 bg-white border-b border-border shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-full"
                >
                    <i className="ri-menu-line text-xl"></i>
                </button>

                {/* Breadcrumb or Page Title could go here */}
                <div className="hidden md:block text-sm text-text-muted">
                    Welcome back, <span className="font-semibold text-text-main">User</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-body hover:text-accent transition-colors">
                    <i className="ri-notification-3-line text-xl"></i>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-divider mx-2"></div>

                {/* Profile */}
                <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-body pr-4 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                        US
                    </div>
                    <div className="hidden md:block text-left">
                        <div className="text-sm font-bold text-text-main leading-tight">User Name</div>
                        <div className="text-xs text-text-muted">Visitor</div>
                    </div>
                    <i className="ri-arrow-down-s-line text-text-muted hidden md:block"></i>
                </div>
            </div>
        </header>
    );
};

export default Header;
