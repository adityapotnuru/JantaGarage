const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen/Staff/Admin)
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, latitude, longitude } = req.body;

        // Basic validation
        if (!title || !description || !category || !latitude || !longitude) {
            return res.status(400).json({ 
                message: 'Validation failed. Title, description, category, latitude, and longitude are required.' 
            });
        }

        // Parse coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ message: 'Latitude and Longitude must be valid numbers.' });
        }

        // Image file path (if uploaded)
        let imagePath = '';
        if (req.file) {
            // Store as a relative uploads path (e.g. 'uploads/image-123456.png')
            imagePath = `uploads/${req.file.filename}`;
        }

        // Create new complaint object
        const complaint = new Complaint({
            title,
            description,
            category,
            priority: priority || 'Medium',
            latitude: lat,
            longitude: lng,
            image: imagePath,
            createdBy: req.user._id
        });

        // Save complaint
        await complaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });
    } catch (error) {
        console.error('Create complaint error:', error.message);
        res.status(500).json({ message: 'Server error while submitting complaint' });
    }
};

// @desc    Get current user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen/Staff/Admin)
const getMyComplaints = async (req, res) => {
    try {
        // Find complaints created by user, populate references (excluding passwords)
        const complaints = await Complaint.find({ createdBy: req.user._id })
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Get my complaints error:', error.message);
        res.status(500).json({ message: 'Server error while retrieving your complaints' });
    }
};

// @desc    Get individual complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('createdBy', 'name email role phone address')
            .populate('assignedTo', 'name email role phone address');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        res.status(200).json(complaint);
    } catch (error) {
        console.error('Get complaint by ID error:', error.message);
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Complaint not found.' });
        }
        res.status(500).json({ message: 'Server error while retrieving complaint details' });
    }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff/Admin only)
const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Check if status is valid
        const allowedStatuses = ['Assigned', 'In Progress', 'Resolved'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}` 
            });
        }

        // Find complaint
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        // Update status and save
        complaint.status = status;
        
        // If status is Assigned and assignedTo is not set, or we want to allow updating the handler:
        if (status === 'Assigned' && req.body.assignedTo) {
            complaint.assignedTo = req.body.assignedTo;
        } else if (status === 'Assigned' && !complaint.assignedTo) {
            // Default assign to current staff member processing it
            complaint.assignedTo = req.user._id;
        }

        await complaint.save();

        // Populate updated fields before returning
        const updatedComplaint = await Complaint.findById(complaint._id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        res.status(200).json(updatedComplaint);
    } catch (error) {
        console.error('Update complaint status error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Complaint not found.' });
        }
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaintStatus
};
