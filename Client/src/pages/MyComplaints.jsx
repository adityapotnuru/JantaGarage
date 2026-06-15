import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../services/complaintService';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const data = await getMyComplaints();
                setComplaints(data);
            } catch (err) {
                console.error('Fetch complaints error:', err);
                setError(err.message || 'Failed to retrieve your complaints list.');
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    // Color mapper helpers for badges
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

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">My Submitted Complaints</h1>
                        <p className="text-sm text-slate-500">Track and manage your filed municipal complaints</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/" className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-sm transition">
                            Back to Home
                        </Link>
                        <Link to="/submit-complaint" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm">
                            🆕 New Complaint
                        </Link>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm mb-6 font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 text-sm">Retrieving your complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                        <span className="text-5xl block mb-4">📋</span>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No Complaints Found</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                            You have not submitted any complaints yet. If you see any community workshop or neighborhood issue, report it!
                        </p>
                        <Link to="/submit-complaint" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm inline-block">
                            File Your First Complaint
                        </Link>
                    </div>
                ) : (
                    /* Complaints Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complaints.map((comp) => (
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

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                            {comp.category}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded font-medium border ${getPriorityStyles(comp.priority)}`}>
                                            {comp.priority} Priority
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">
                                        {new Date(comp.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <Link to={`/complaints/${comp._id}`} className="bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 font-semibold px-3 py-1.5 rounded transition shadow-sm">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyComplaints;
