import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/complaints';

// Helper to get auth header with token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// @desc    Submit a new complaint
export const createComplaint = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(API_BASE_URL, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while submitting complaint.' };
    }
};

// @desc    Get all complaints created by the current user
export const getMyComplaints = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/my`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while fetching your complaints.' };
    }
};

// @desc    Get detailed view of a single complaint by ID
export const getComplaintById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while fetching complaint details.' };
    }
};

// @desc    Update complaint status (staff/admin only)
export const updateComplaintStatus = async (id, status, assignedTo) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/${id}/status`, 
            { status, assignedTo }, 
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while updating status.' };
    }
};

// @desc    Get all complaints in system (staff/admin only)
export const getAllComplaints = async () => {
    try {
        const response = await axios.get(API_BASE_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while fetching complaints list.' };
    }
};

// @desc    Get public complaints data for reports
export const getPublicReport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/public-report`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred while fetching public report data.' };
    }
};
