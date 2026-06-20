import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicReport } from '../services/complaintService';
import Layout from '../components/Layout';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Reports = () => {
    const { user, logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // Chart references
    const categoryChartRef = useRef(null);
    const statusChartRef = useRef(null);
    const priorityChartRef = useRef(null);
    
    // Chart instances
    const categoryChartInst = useRef(null);
    const statusChartInst = useRef(null);
    const priorityChartInst = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const reportData = await getPublicReport();
                setData(reportData);
            } catch (err) {
                console.error('Error fetching public report data:', err);
                setError(err.message || 'Failed to fetch report data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Render charts when data changes and user is logged in
    useEffect(() => {
        if (loading || data.length === 0 || !user) return;

        // Destroy previous instances if they exist
        if (categoryChartInst.current) categoryChartInst.current.destroy();
        if (statusChartInst.current) statusChartInst.current.destroy();
        if (priorityChartInst.current) priorityChartInst.current.destroy();

        // 1. Process Category Data
        const categories = ['Road Damage', 'Garbage', 'Water Leakage', 'Electricity', 'Others'];
        const categoryCounts = categories.map(cat => data.filter(item => item.category === cat).length);
        
        // 2. Process Status Data
        const statuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
        const statusCounts = statuses.map(stat => data.filter(item => item.status === stat).length);

        // 3. Process Priority Data
        const priorities = ['Low', 'Medium', 'High'];
        const priorityCounts = priorities.map(pri => data.filter(item => item.priority === pri).length);

        // Render Category Pie Chart
        if (categoryChartRef.current) {
            const ctx = categoryChartRef.current.getContext('2d');
            categoryChartInst.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        data: categoryCounts,
                        backgroundColor: [
                            '#4f46e5', // Indigo (Road Damage)
                            '#f59e0b', // Amber (Garbage)
                            '#06b6d4', // Cyan (Water Leakage)
                            '#eab308', // Yellow (Electricity)
                            '#64748b'  // Slate (Others)
                        ],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#334155',
                                font: { weight: '500', size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const value = context.raw;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return ` ${context.label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Render Status Doughnut Chart
        if (statusChartRef.current) {
            const ctx = statusChartRef.current.getContext('2d');
            statusChartInst.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: statuses,
                    datasets: [{
                        data: statusCounts,
                        backgroundColor: [
                            '#94a3b8', // Submitted (Slate)
                            '#3b82f6', // Assigned (Blue)
                            '#f97316', // In Progress (Orange)
                            '#10b981'  // Resolved (Emerald)
                        ],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#334155',
                                font: { weight: '500', size: 12 }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // Render Priority Bar Chart
        if (priorityChartRef.current) {
            const ctx = priorityChartRef.current.getContext('2d');
            priorityChartInst.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: priorities,
                    datasets: [{
                        label: 'Complaints count',
                        data: priorityCounts,
                        backgroundColor: [
                            '#cbd5e1', // Low (Slate-300)
                            '#fcd34d', // Medium (Amber-300)
                            '#fca5a5'  // High (Red-300)
                        ],
                        borderColor: [
                            '#94a3b8',
                            '#f59e0b',
                            '#ef4444'
                        ],
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: '#64748b'
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: { color: '#64748b' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (categoryChartInst.current) categoryChartInst.current.destroy();
            if (statusChartInst.current) statusChartInst.current.destroy();
            if (priorityChartInst.current) priorityChartInst.current.destroy();
        };
    }, [data, loading, user]);

    // CSV Export Logic
    const handleExportCSV = () => {
        if (!data || data.length === 0) return;

        const headers = ['Complaint ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Created Date'];
        
        const rows = data.map(item => [
            item._id,
            item.title.includes(',') || item.title.includes('"') ? `"${item.title.replace(/"/g, '""')}"` : item.title,
            item.description.includes(',') || item.description.includes('"') ? `"${item.description.replace(/"/g, '""')}"` : item.description,
            item.category,
            item.priority,
            item.status,
            new Date(item.createdAt).toLocaleString()
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `JantaGarage_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtered data for preview table
    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Content of the Reports page
    const reportsContent = (
        <div className="space-y-8 max-w-6xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
                        Transparency Reports
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View civic workshop activity logs, filter data, and download complete reports.
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={data.length === 0}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    📥 Download CSV Report
                </button>
            </div>

            {/* Loading & Error notifications */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 text-sm">Loading transparency data...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Charts Showcase Area */}
                    <div className="relative">
                        {/* If user is not logged in, overlay a lock layer with blur */}
                        {!user && (
                            <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-slate-900/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-200">
                                <div className="bg-white/95 border border-slate-200 shadow-xl rounded-2xl p-8 max-w-md space-y-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                        📊
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Visual Analytics Dashboard Locked</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Data transparency reports are public, but charts and interactive graphs are restricted to authenticated users.
                                    </p>
                                    <div className="flex gap-3 justify-center pt-2">
                                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition">
                                            Login
                                        </Link>
                                        <Link to="/signup" className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition">
                                            Register
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!user ? 'opacity-40 select-none pointer-events-none' : ''}`}>
                            {/* Categories Pie Chart Card */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Complaints by Category</h3>
                                <div className="flex-1 relative">
                                    {user ? <canvas ref={categoryChartRef} /> : <div className="h-full bg-slate-50 rounded" />}
                                </div>
                            </div>

                            {/* Status Doughnut Chart Card */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Complaints by Status</h3>
                                <div className="flex-1 relative">
                                    {user ? <canvas ref={statusChartRef} /> : <div className="h-full bg-slate-50 rounded" />}
                                </div>
                            </div>

                            {/* Priority Bar Chart Card */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Complaints by Priority</h3>
                                <div className="flex-1 relative">
                                    {user ? <canvas ref={priorityChartRef} /> : <div className="h-full bg-slate-50 rounded" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Filter & Table Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Public Logs Preview</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Showing {filteredData.length} of {data.length} total logged complaints.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search complaints..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 bg-white"
                                />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 bg-white"
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Road Damage">Road Damage</option>
                                    <option value="Garbage">Garbage</option>
                                    <option value="Water Leakage">Water Leakage</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>

                        {/* Public Preview Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Priority</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Created Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                                    {filteredData.length > 0 ? (
                                        filteredData.slice(0, 10).map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                                        item.priority === 'High' ? 'bg-red-50 text-red-700' :
                                                        item.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-slate-50 text-slate-600'
                                                    }`}>
                                                        {item.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                                        item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                                                        item.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                                                        item.status === 'Assigned' ? 'bg-blue-50 text-blue-700' :
                                                        'bg-slate-50 text-slate-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-slate-400">
                                                No public logs match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredData.length > 10 && (
                            <div className="p-4 border-t border-slate-200 text-center text-slate-400 text-xs font-medium">
                                Preview showing first 10 items. Download full CSV report for complete logs list.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    // If user is logged in, wrap the content in Layout
    if (user) {
        return <Layout>{reportsContent}</Layout>;
    }

    // If user is not logged in, render with a Guest Nav Header and standard structure
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
            {/* Navigation Header */}
            <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 no-underline">
                        <span className="text-2xl">🛠️</span>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            JantaGarage
                        </span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                            Home
                        </Link>
                        <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                            Login
                        </Link>
                        <Link to="/signup" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm">
                            Sign Up
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content container for Guest */}
            <main className="flex-1 py-10 px-6 sm:px-8">
                {reportsContent}
            </main>

            {/* Footer */}
            <footer className="w-full py-6 border-t border-slate-200 bg-white text-center text-slate-400 text-xs font-medium mt-10">
                <div className="max-w-6xl mx-auto px-6">
                    &copy; {new Date().getFullYear()} JantaGarage. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Reports;
