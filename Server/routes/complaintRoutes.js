const express = require('express');
const { 
    createComplaint, 
    getMyComplaints, 
    getComplaintById, 
    updateComplaintStatus,
    getAllComplaints
} = require('../controllers/complaintController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// @route   GET /api/complaints
// @desc    Get all complaints in system (staff/admin only)
router.get('/', authorizeRoles('staff', 'admin'), getAllComplaints);

// @route   POST /api/complaints
// @desc    Citizen submit a new complaint with optional image upload
router.post('/', upload, createComplaint);

// @route   GET /api/complaints/my
// @desc    Get current user's submitted complaints
router.get('/my', getMyComplaints);

// @route   GET /api/complaints/:id
// @desc    Get individual complaint details by ID
router.get('/:id', getComplaintById);

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status (staff/admin only)
router.patch('/:id/status', authorizeRoles('staff', 'admin'), updateComplaintStatus);

module.exports = router;
