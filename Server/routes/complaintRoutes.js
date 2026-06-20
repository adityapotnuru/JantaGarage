const express = require('express');
const { 
    createComplaint, 
    getMyComplaints, 
    getComplaintById, 
    updateComplaintStatus,
    getAllComplaints,
    getPublicReport
} = require('../controllers/complaintController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public route for complaints data report (accessible with/without login)
router.get('/public-report', getPublicReport);

// Public route to manually trigger auto-escalation check (useful for testing/cron)
router.post('/trigger-escalation', async (req, res) => {
    try {
        const { runAutoEscalation } = require('../services/escalationService');
        const results = await runAutoEscalation();
        res.status(200).json({
            success: true,
            message: 'Auto-escalation check completed successfully',
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to run auto-escalation check',
            error: error.message
        });
    }
});

// Apply authMiddleware to all routes below in this router
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
