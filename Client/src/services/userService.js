import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth/users';

// Helper to get auth header with token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// @desc    Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const response = await axios.get(API_BASE_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while fetching users list.' };
    }
};

// @desc    Toggle active status of a user (admin only)
export const toggleUserActive = async (id) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}/toggle-active`, {}, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while toggling user status.' };
    }
};

// @desc    Update a user's role (admin only)
export const updateUserRole = async (id, role) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}/role`, { role }, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while updating user role.' };
    }
};
