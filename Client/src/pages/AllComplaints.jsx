import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllComplaints, updateComplaintStatus } from '../services/complaintService';

const AllComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch complaints list
    const fetchComplaints = async () => {
        try {
            setError('');
            const data = await getAllComplaints();
            setComplaints(data);
            setFilteredComplaints(data);
        } catch (err) {
            console.error('Fetch all complaints error:', err);
            setError(err.message || 'Failed to retrieve complaints directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Filter logic
    useEffect(() => {
        let temp = [...complaints];

        // Search text filter
        if (search.trim()) {
            const query = search.toLowerCase();
            temp = temp.filter(
                c => 
                    c.title.toLowerCase().includes(query) || 
                    c.description.toLowerCase().includes(query) ||
                    (c.createdBy?.name || '').toLowerCase().includes(query)
            );
        }

        // Category filter
        if (categoryFilter) {
            temp = temp.filter(c => c.category === categoryFilter);
        }

        // Priority filter
        if (priorityFilter) {
            temp = temp.filter(c => c.priority === priorityFilter);
        }

        // Status filter
        if (statusFilter) {
            temp = temp.filter(c => c.status === statusFilter);
        }

        setFilteredComplaints(temp);
    }, [search, categoryFilter, priorityFilter, statusFilter, complaints]);

    // Handle Quick Self-Assignment
    const handleSelfAssign = async (complaintId) => {
        try {
            setError('');
            setSuccessMessage('');
            // Status -> Assigned, assignedTo -> current user's ID
            await updateComplaintStatus(complaintId, 'Assigned', user.id);
            setSuccessMessage('Ticket assigned to you successfully!');
            fetchComplaints(); // Refresh list
        } catch (err) {
            setError(err.message || 'Failed to self-assign ticket.');
        }
    };

    // Handle Quick Status Update
    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            setError('');
            setSuccessMessage('');
            await updateComplaintStatus(complaintId, newStatus);
            setSuccessMessage(`Ticket status updated to "${newStatus}"!`);
            fetchComplaints();
        } catch (err) {
            setError(err.message || 'Failed to update ticket status.');
        }
    };

    // Robust CSV Export
    const exportToCSV = () => {
        const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Submitted By', 'Assigned To', 'Latitude', 'Longitude', 'Created At'];
        const rows = filteredComplaints.map(c => [
            c._id,
            `"${c.title.replace(/"/g, '""')}"`,
            `"${c.description.replace(/"/g, '""')}"`,
            c.category,
            c.priority,
            c.status,
            c.createdBy?.name || 'Unknown',
            c.assignedTo?.name || 'Unassigned',
            c.latitude,
            c.longitude,
            new Date(c.createdAt).toLocaleString()
        ]);

        const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `JantaGarage_Complaints_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Status Badge Helpers
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'In Progress':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Assigned':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Submitted':
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Low':
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 text-sm">Retrieving complaints directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full">
            {/* Header & CSV CTA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Complaints Registry</h1>
                    <p className="text-sm text-slate-500">Manage, assign, and track all submitted ticket lifecycles</p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={filteredComplaints.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm cursor-pointer"
                >
                    <span>📥</span> Export matching to CSV
                </button>
            </div>

            {/* Notification Banners */}
            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-lg text-sm font-medium">
                    ✅ {successMessage}
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Text */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Search text</label>
                    <input 
                        type="text" 
                        placeholder="Search title, details, citizen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50"
                    />
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Category</label>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50"
                    >
                        <option value="">All Categories</option>
                        <option value="Road Damage">Road Damage</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Water Leakage">Water Leakage</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Others">Others</option>
                    </select>
                </div>

                {/* Priority Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Priority</label>
                    <select 
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50"
                    >
                        <option value="">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                {/* Status Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Status</label>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50"
                    >
                        <option value="">All Statuses</option>
                        <option value="Submitted">Submitted (Unassigned)</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Complaints Listing Grid */}
            {filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <span className="text-4xl block mb-3">🔍</span>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No Matching Tickets</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        We couldn't find any complaints that match your search filters. Try clearing some criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredComplaints.map((comp) => {
                        const isAssignedToMe = comp.assignedTo?._id === user.id || comp.assignedTo === user.id;
                        
                        return (
                            <div key={comp._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-slate-800 leading-snug text-base line-clamp-1">{comp.title}</h3>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusStyles(comp.status)}`}>
                                            {comp.status}
                                        </span>
                                    </div>
                                    
                                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                        {comp.description}
                                    </p>

                                    {/* Sub-info tags */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                            🏷️ {comp.category}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded font-medium border ${getPriorityStyles(comp.priority)}`}>
                                            ⚡ {comp.priority} Priority
                                        </span>
                                        <span className="bg-slate-150 text-slate-600 px-2 py-0.5 rounded font-medium">
                                            👤 By: {comp.createdBy?.name || 'Citizen'}
                                        </span>
                                    </div>

                                    {/* Handler Info */}
                                    <div className="text-xs text-slate-400 font-medium">
                                        {comp.assignedTo ? (
                                            <p>🛠️ Handler: <span className="text-slate-700 font-semibold">{comp.assignedTo?.name}</span></p>
                                        ) : (
                                            <p className="text-amber-600 font-semibold">⚠️ Unassigned</p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions footer bar */}
                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex gap-1.5">
                                        {/* Show self-assign if unassigned or assigned to someone else */}
                                        {!comp.assignedTo && (
                                            <button 
                                                onClick={() => handleSelfAssign(comp._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                                            >
                                                🙋‍♂️ Assign to Me
                                            </button>
                                        )}

                                        {/* Status transitions */}
                                        {comp.status === 'Assigned' && isAssignedToMe && (
                                            <button 
                                                onClick={() => handleStatusUpdate(comp._id, 'In Progress')}
                                                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                                            >
                                                ⚙️ Start Progress
                                            </button>
                                        )}
                                        {comp.status === 'In Progress' && isAssignedToMe && (
                                            <button 
                                                onClick={() => handleStatusUpdate(comp._id, 'Resolved')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                                            >
                                                ✅ Resolve Ticket
                                            </button>
                                        )}
                                    </div>

                                    <Link to={`/complaints/${comp._id}`} className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-3 py-1.5 rounded text-xs transition shadow-sm ml-auto">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllComplaints;
