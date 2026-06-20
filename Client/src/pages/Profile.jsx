import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        phone: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!formData.name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setLoading(true);
        const result = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            address: formData.address
        });
        setLoading(false);

        if (result.success) {
            setSuccessMessage('Your profile has been updated successfully!');
            // Clear message after 4s
            setTimeout(() => setSuccessMessage(''), 4000);
        } else {
            setErrorMessage(result.message || 'Failed to update profile.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 w-full py-2">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-850">My Profile</h1>
                <p className="text-sm text-slate-500">Manage and edit your account details</p>
            </div>

            {/* Notification Banners */}
            {errorMessage && (
                <div className="bg-red-50 text-red-750 border border-red-200 p-4 rounded-xl text-sm font-semibold">
                    ⚠️ {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="bg-emerald-50 text-emerald-755 border border-emerald-200 p-4 rounded-xl text-sm font-semibold">
                    ✅ {successMessage}
                </div>
            )}

            {/* Profile Form Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    {/* General section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition bg-slate-50"
                                required
                            />
                        </div>

                        {/* Email Address (ReadOnly) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address (Read-Only)</label>
                            <input
                                type="email"
                                value={formData.email}
                                className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-slate-100/70 text-slate-400 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number (optional)"
                                className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition bg-slate-50"
                            />
                        </div>

                        {/* System Role (ReadOnly) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designated Role (Read-Only)</label>
                            <div className="border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100/70 text-slate-450 cursor-not-allowed capitalize font-semibold">
                                {formData.role}
                            </div>
                        </div>
                    </div>

                    {/* Address Block */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your street address (optional)"
                            rows="3"
                            className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition bg-slate-50 resize-none"
                        />
                    </div>

                    {/* Save Action */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-sm cursor-pointer"
                        >
                            {loading ? 'Saving Changes...' : 'Save Profile Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
