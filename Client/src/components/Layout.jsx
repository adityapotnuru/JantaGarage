import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define navigation items based on role
    const getNavItems = () => {
        const baseItems = [
            { path: '/dashboard', label: 'Dashboard Overview', icon: '📊' },
            { path: '/reports', label: 'Reports & Analytics', icon: '📈' },
            { path: '/profile', label: 'My Profile', icon: '👤' }
        ];

        if (user?.role === 'citizen') {
            return [
                ...baseItems,
                { path: '/submit-complaint', label: 'Submit Complaint', icon: '✍️' },
                { path: '/my-complaints', label: 'My Complaints', icon: '📋' }
            ];
        }

        if (user?.role === 'staff') {
            return [
                ...baseItems,
                { path: '/all-complaints', label: 'All Complaints', icon: '🗃️' }
            ];
        }

        if (user?.role === 'admin') {
            return [
                ...baseItems,
                { path: '/all-complaints', label: 'All Complaints', icon: '🗃️' },
                { path: '/admin-users', label: 'Manage Users', icon: '👥' }
            ];
        }

        return baseItems;
    };

    const navItems = getNavItems();

    // Map paths to friendly page titles
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard Overview';
        if (path === '/reports') return 'Reports & Analytics';
        if (path === '/profile') return 'My Profile';
        if (path === '/submit-complaint') return 'Submit a Complaint';
        if (path === '/my-complaints') return 'My Submitted Complaints';
        if (path === '/all-complaints') return 'All Complaints Directory';
        if (path === '/admin-users') return 'Registered Users Directory';
        if (path.startsWith('/complaints/')) return 'Complaint Details';
        return 'JantaGarage Portal';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans w-full">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 transform lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Logo */}
                <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950/40">
                    <span className="text-2xl">🔧</span>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        JantaGarage
                    </span>
                </div>

                {/* User Info Capsule */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-slate-100 truncate">{user?.name}</p>
                            <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mt-1 ${
                                user?.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                user?.role === 'staff' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                }`
                            }
                        >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-all cursor-pointer"
                    >
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Hamburguer Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-slate-600 hover:text-slate-900 focus:outline-none p-1.5 hover:bg-slate-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <h2 className="font-bold text-slate-800 text-lg tracking-tight hidden sm:block">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                            <p className="text-sm font-semibold text-slate-700">{user?.email}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Sub-components container */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default Layout;
