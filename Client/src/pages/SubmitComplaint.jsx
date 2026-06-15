import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createComplaint } from '../services/complaintService';

const SubmitComplaint = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        latitude: '',
        longitude: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = ['Road Damage', 'Garbage', 'Water Leakage', 'Electricity', 'Others'];
    const priorities = ['Low', 'Medium', 'High'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be under 5MB.');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Premium helper to fetch citizen's current device coordinates
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                });
                setLoading(false);
                setError('');
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve location. Please input coordinates manually.');
                setLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { title, description, category, latitude, longitude } = formData;

        // Validation checks
        if (!title.trim() || !description.trim() || !category || !latitude || !longitude) {
            setError('Please fill in all required fields (Title, Description, Category, Coordinates).');
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            setError('Latitude and Longitude must be valid numbers.');
            return;
        }

        setLoading(true);

        try {
            // Build FormData for multipart file upload
            const data = new FormData();
            data.append('title', title.trim());
            data.append('description', description.trim());
            data.append('category', category);
            data.append('priority', formData.priority);
            data.append('latitude', lat);
            data.append('longitude', lng);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const result = await createComplaint(data);

            if (result.success) {
                setSuccess('Complaint submitted successfully!');
                // Reset form fields
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    priority: 'Medium',
                    latitude: '',
                    longitude: ''
                });
                setImageFile(null);
                setImagePreview('');
                
                // Redirect after brief delay to allow user to see success message
                setTimeout(() => {
                    navigate('/my-complaints');
                }, 1500);
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Report a Complaint</h2>
                        <p className="text-xs text-blue-100">Submit neighborhood issues directly to municipal staff</p>
                    </div>
                    <Link to="/my-complaints" className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg font-medium transition">
                        My Complaints
                    </Link>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

                    {/* Title */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1.5">Complaint Title *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g., Pothole on Sector 4 Main Road"
                            value={formData.title}
                            onChange={handleChange}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition"
                            required
                        />
                    </div>

                    {/* Category & Priority Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition bg-white"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition bg-white"
                            >
                                {priorities.map((prio) => (
                                    <option key={prio} value={prio}>{prio}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1.5">Detailed Description *</label>
                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Describe the complaint in detail (e.g., exact location landmark, dimensions of damage, duration of issue)..."
                            value={formData.description}
                            onChange={handleChange}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* Location Coordinates */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-800">Geolocation Details *</label>
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                disabled={loading}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                            >
                                📍 Use Current Location
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-600 mb-1">Latitude</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    placeholder="e.g., 28.6139"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none bg-white transition"
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-600 mb-1">Longitude</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    placeholder="e.g., 77.2090"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-blue-500 focus:outline-none bg-white transition"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Attachment Upload */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1.5">Attach Image (Optional, max 5MB)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-slate-400 transition cursor-pointer relative bg-slate-50">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {imagePreview ? (
                                <div className="text-center">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="h-32 object-contain rounded border border-slate-200 mb-2 mx-auto" 
                                    />
                                    <p className="text-xs text-slate-500">{imageFile?.name}</p>
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <span className="text-2xl mb-1 block">📷</span>
                                    <p className="text-sm text-slate-700 font-medium">Click or Drag to Upload Image</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG, or WEBP up to 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg shadow-sm transition mt-4"
                    >
                        {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitComplaint;
