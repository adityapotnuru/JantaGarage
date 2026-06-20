import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';

const ComplaintDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Status update states for staff/admin
    const [statusForm, setStatusForm] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const data = await getComplaintById(id);
                setComplaint(data);
                setStatusForm(data.status);
            } catch (err) {
                console.error('Fetch complaint details error:', err);
                setError(err.message || 'Failed to retrieve complaint details.');
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [id]);

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (statusForm === complaint.status) {
            setError('Please select a different status to update.');
            return;
        }

        setStatusLoading(true);
        try {
            const updated = await updateComplaintStatus(id, statusForm);
            setComplaint(updated);
            setSuccess('Complaint status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Status update error:', err);
            setError(err.message || 'Failed to update complaint status.');
        } finally {
            setStatusLoading(false);
        }
    };

    // Style helper functions
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Resolved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'In Progress':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Assigned':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Submitted':
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'Medium':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Low':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 text-sm">Loading complaint details...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 px-4 w-full">
                <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                    <span className="text-5xl block mb-4">🔍</span>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Complaint Not Found</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        The complaint ID might be invalid or you may not have permission to view it.
                    </p>
                    <Link to="/my-complaints" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm">
                        Back to My Complaints
                    </Link>
                </div>
            </div>
        );
    }

    const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
            <div className="max-w-4xl w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md">
                
                {/* Header Navbar */}
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Complaint Details</span>
                        <h2 className="text-lg font-bold text-slate-100 line-clamp-1">{complaint.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        {user ? (
                            <Link 
                                to={isStaffOrAdmin ? '/' : '/my-complaints'} 
                                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
                            >
                                Back
                            </Link>
                        ) : null}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: General Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-lg text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3.5 rounded-lg text-sm font-medium">
                                ✅ {success}
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {complaint.description}
                            </p>
                        </div>

                        {/* Image Preview */}
                        {complaint.image && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Image</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-h-96 flex items-center justify-center p-2">
                                    <img 
                                        src={complaint.image.startsWith('http') ? complaint.image : `http://localhost:5000/${complaint.image}`} 
                                        alt={complaint.title} 
                                        className="max-h-80 object-contain rounded"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Metadata Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Created By</span>
                                <h5 className="font-semibold text-slate-800 text-sm mt-0.5">{complaint.createdBy?.name}</h5>
                                <p className="text-xs text-slate-500">{complaint.createdBy?.email}</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Staff</span>
                                {complaint.assignedTo ? (
                                    <>
                                        <h5 className="font-semibold text-slate-800 text-sm mt-0.5">{complaint.assignedTo?.name}</h5>
                                        <p className="text-xs text-slate-500">{complaint.assignedTo?.email}</p>
                                    </>
                                ) : (
                                    <p className="text-slate-500 font-medium text-xs mt-1">Not assigned yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Info Panel */}
                    <div className="space-y-6">
                        
                        {/* Status/Priority Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm">Status & Severity</h4>
                            
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-500 font-medium">Status Badge</span>
                                <span className={`inline-block border text-center font-bold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wide ${getStatusBadgeClass(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-500 font-medium">Priority Badge</span>
                                <span className={`inline-block border text-center font-bold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wide ${getPriorityBadgeClass(complaint.priority)}`}>
                                    {complaint.priority}
                                </span>
                            </div>

                            <div className="border-t border-slate-200 pt-3 flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Submitted Date</span>
                                <span className="text-xs font-semibold text-slate-700">
                                    {new Date(complaint.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Location / Coordinates Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                            <h4 className="font-bold text-slate-800 text-sm">Geographical Location</h4>
                            <div className="text-xs text-slate-600 space-y-1">
                                <p><strong>Latitude:</strong> {complaint.latitude}</p>
                                <p><strong>Longitude:</strong> {complaint.longitude}</p>
                            </div>
                            
                            {/* External Google Maps Redirect Link */}
                            <a
                                href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center text-xs bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 font-bold py-2 rounded-lg transition"
                            >
                                🗺️ View on Google Maps
                            </a>
                        </div>

                        {/* Staff / Admin Actions Panel */}
                        {isStaffOrAdmin && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                                <h4 className="font-bold text-blue-900 text-sm">Update Resolution Status</h4>
                                
                                <form onSubmit={handleStatusUpdate} className="space-y-3">
                                    <div className="flex flex-col">
                                        <select
                                            value={statusForm}
                                            onChange={(e) => setStatusForm(e.target.value)}
                                            className="px-3 py-2 border border-blue-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white transition"
                                        >
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={statusLoading || statusForm === complaint.status}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 rounded-lg text-xs transition shadow-sm"
                                    >
                                        {statusLoading ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
