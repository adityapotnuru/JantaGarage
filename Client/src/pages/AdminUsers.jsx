import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, toggleUserActive, updateUserRole } from '../services/userService';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            setError('');
            const data = await getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            console.error('Fetch all users error:', err);
            setError(err.message || 'Failed to retrieve registered users list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users on search
    useEffect(() => {
        if (!search.trim()) {
            setFilteredUsers(users);
        } else {
            const query = search.toLowerCase();
            const filtered = users.filter(
                u => 
                    u.name.toLowerCase().includes(query) || 
                    u.email.toLowerCase().includes(query) ||
                    (u.phone && u.phone.includes(query)) ||
                    u.role.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [search, users]);

    // Handle Toggling Account Activation
    const handleToggleActive = async (userToModify) => {
        if (userToModify._id === currentUser.id) {
            setError('Safety Warning: You cannot deactivate your own account.');
            return;
        }

        try {
            setError('');
            setSuccessMessage('');
            const response = await toggleUserActive(userToModify._id);
            setSuccessMessage(response.message);
            fetchUsers(); // Refresh
        } catch (err) {
            setError(err.message || 'Failed to update user active status.');
        }
    };

    // Handle Role Updates
    const handleRoleChange = async (userToModify, newRole) => {
        if (userToModify._id === currentUser.id && newRole !== 'admin') {
            setError('Safety Warning: You cannot remove your own administrator privileges.');
            return;
        }

        try {
            setError('');
            setSuccessMessage('');
            const response = await updateUserRole(userToModify._id, newRole);
            setSuccessMessage(response.message);
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to update user role.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 text-sm">Retrieving users directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">User Registry Directory</h1>
                <p className="text-sm text-slate-500">Manage user accounts, assign roles, and activate/deactivate accounts</p>
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

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Search by name, email, phone, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50 w-full sm:max-w-md"
                />
                <span className="text-xs text-slate-400 font-medium">
                    Showing {filteredUsers.length} of {users.length} users
                </span>
            </div>

            {/* Directory Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Role Designation</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredUsers.map((u) => {
                                const isSelf = u._id === currentUser.id;
                                
                                return (
                                    <tr key={u._id} className={isSelf ? "bg-blue-50/30" : ""}>
                                        {/* User Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                                        {u.name}
                                                        {isSelf && (
                                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                Me
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-normal">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact info */}
                                        <td className="px-6 py-4 text-xs font-normal">
                                            <p className="text-slate-600"><span className="text-slate-400">Phone:</span> {u.phone || 'N/A'}</p>
                                            <p className="text-slate-600 truncate max-w-xs mt-0.5"><span className="text-slate-400">Address:</span> {u.address || 'N/A'}</p>
                                        </td>

                                        {/* Role Selector */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u, e.target.value)}
                                                className="border border-slate-200 rounded-lg py-1 px-2.5 text-xs outline-none focus:border-blue-500 bg-white"
                                            >
                                                <option value="citizen">Citizen</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border ${
                                                u.isActive 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {u.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>

                                        {/* Actions toggler */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleActive(u)}
                                                disabled={isSelf}
                                                className={`px-3 py-1.5 rounded text-xs font-bold transition shadow-sm cursor-pointer ${
                                                    isSelf
                                                        ? 'bg-slate-100 text-slate-350 cursor-not-allowed border border-slate-200'
                                                        : u.isActive
                                                            ? 'bg-red-50 hover:bg-red-100 text-red-650 border border-red-200'
                                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-650 border border-emerald-200'
                                                }`}
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
