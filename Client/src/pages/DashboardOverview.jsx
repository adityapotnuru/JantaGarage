import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints, getAllComplaints } from '../services/complaintService';
import { getAllUsers } from '../services/userService';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        highPriority: 0,
        myAssigned: 0,
        totalUsers: 0,
        citizenCount: 0,
        staffCount: 0,
        adminCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                setLoading(true);
                if (user?.role === 'citizen') {
                    // Fetch personal complaints
                    const myData = await getMyComplaints();
                    calculateCitizenStats(myData);
                } else if (user?.role === 'staff') {
                    // Fetch all complaints
                    const allData = await getAllComplaints();
                    calculateStaffStats(allData);
                } else if (user?.role === 'admin') {
                    // Fetch all complaints and all users
                    const [allData, allUsers] = await Promise.all([
                        getAllComplaints(),
                        getAllUsers()
                    ]);
                    calculateAdminStats(allData, allUsers);
                }
            } catch (err) {
                console.error('Error fetching dashboard statistics:', err);
                setError(err.message || 'Failed to populate dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOverviewData();
        }
    }, [user]);

    const calculateCitizenStats = (complaints) => {
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const assigned = complaints.filter(c => c.status === 'Assigned').length;
        const submitted = complaints.filter(c => c.status === 'Submitted').length;
        const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

        setStats({
            total: complaints.length,
            submitted,
            assigned,
            inProgress,
            resolved,
            highPriority
        });
    };

    const calculateStaffStats = (complaints) => {
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const assigned = complaints.filter(c => c.status === 'Assigned').length;
        const submitted = complaints.filter(c => c.status === 'Submitted').length;
        const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;
        const myAssigned = complaints.filter(c => c.assignedTo?._id === user?.id || c.assignedTo === user?.id).length;

        setStats({
            total: complaints.length,
            submitted,
            assigned,
            inProgress,
            resolved,
            highPriority,
            myAssigned
        });
    };

    const calculateAdminStats = (complaints, users) => {
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const assigned = complaints.filter(c => c.status === 'Assigned').length;
        const submitted = complaints.filter(c => c.status === 'Submitted').length;
        const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

        const citizenCount = users.filter(u => u.role === 'citizen').length;
        const staffCount = users.filter(u => u.role === 'staff').length;
        const adminCount = users.filter(u => u.role === 'admin').length;

        setStats({
            total: complaints.length,
            submitted,
            assigned,
            inProgress,
            resolved,
            highPriority,
            totalUsers: users.length,
            citizenCount,
            staffCount,
            adminCount
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 text-sm">Populating your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium">
                ⚠️ {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto w-full">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
                    Welcome back, {user?.name}!
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Here's a breakdown of the JantaGarage portal activity.
                </p>
            </div>

            {/* CITIZEN OVERVIEW */}
            {user?.role === 'citizen' && (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">📋</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">My Reports</h3>
                                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Total tickets filed by you</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">⚡</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">In Progress</h3>
                                <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.inProgress + stats.assigned}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Tickets currently being handled</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">✅</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Resolved</h3>
                                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Successfully resolved complaints</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">🔥</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Active High Priority</h3>
                                <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.highPriority}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Unresolved high urgency complaints</p>
                        </div>
                    </div>

                    {/* Quick CTAs */}
                    <div className="bg-blue-600 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 max-w-xl">
                            <h3 className="text-xl font-bold">Have a new municipal concern or issue?</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Submit a ticket with location coordinates and upload a snapshot. Our municipal staff will take swift action and keep you updated throughout the ticket lifecycle.
                            </p>
                        </div>
                        <Link 
                            to="/submit-complaint" 
                            className="bg-white hover:bg-slate-100 text-blue-600 font-bold px-6 py-3 rounded-xl text-sm transition shadow-md whitespace-nowrap self-stretch md:self-auto text-center"
                        >
                            ✍️ Submit a Complaint
                        </Link>
                    </div>
                </>
            )}

            {/* STAFF OVERVIEW */}
            {user?.role === 'staff' && (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">📥</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Pending Action</h3>
                                <p className="text-3xl font-extrabold text-indigo-600 mt-1">{stats.submitted}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Newly submitted, unassigned tickets</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">🙋‍♂️</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">My Workload</h3>
                                <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.myAssigned}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Tickets assigned to you currently</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">⚡</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">In Progress</h3>
                                <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.inProgress}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Total active tickets system-wide</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">🔥</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Critical Urgency</h3>
                                <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.highPriority}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">High priority complaints pending resolution</p>
                        </div>
                    </div>

                    {/* Quick CTAs */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 max-w-xl">
                            <h3 className="text-xl font-bold">Manage complaint directory and updates</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Self-assign tickets, communicate progress, change priorities, or mark tickets as resolved once operations are completed in the field.
                            </p>
                        </div>
                        <Link 
                            to="/all-complaints" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md whitespace-nowrap self-stretch md:self-auto text-center"
                        >
                            🗃️ View Complaints Directory
                        </Link>
                    </div>
                </>
            )}

            {/* ADMIN OVERVIEW */}
            {user?.role === 'admin' && (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">🗳️</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Total Tickets</h3>
                                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Total complaints in the database</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">👥</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Registered Users</h3>
                                <p className="text-3xl font-extrabold text-indigo-600 mt-1">{stats.totalUsers}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Citizens ({stats.citizenCount}), Staff ({stats.staffCount}), Admins ({stats.adminCount})</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">✅</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Resolved</h3>
                                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">Total resolved cases in system</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                            <div>
                                <span className="text-2xl">🔥</span>
                                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3">Critical Pending</h3>
                                <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.highPriority}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">High priority, unresolved complaints</p>
                        </div>
                    </div>

                    {/* Quick CTAs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between items-start gap-4">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold">Complaints Management</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Monitor system-wide complaints, review details, change ticket status, or download CSV reports for external audits.
                                </p>
                            </div>
                            <Link 
                                to="/all-complaints" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition shadow-sm w-full text-center"
                            >
                                🗃️ View Complaints Directory
                            </Link>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-start gap-4">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-800">User Administration</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Access registrations directory. Instantly activate/deactivate user accounts or change user roles dynamically.
                                </p>
                            </div>
                            <Link 
                                to="/admin-users" 
                                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition shadow-sm w-full text-center"
                            >
                                👥 Manage User Accounts
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardOverview;
