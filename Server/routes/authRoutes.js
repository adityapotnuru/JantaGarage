const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe, getAllUsers, toggleUserActive, updateUserRole, updateProfile } = require('../controllers/authControllers');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post(
    '/signup',
    [
        body('name', 'Name is required').not().isEmpty().trim().isLength({ max: 100 }),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
        body('role', 'Invalid role').optional().isIn(['citizen', 'staff', 'admin']),
        body('phone').optional().trim(),
        body('address').optional().trim()
    ],
    signup
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists()
    ],
    login
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateProfile);

// Admin User Management routes
router.get('/users', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/toggle-active', authMiddleware, authorizeRoles('admin'), toggleUserActive);
router.patch('/users/:id/role', authMiddleware, authorizeRoles('admin'), updateUserRole);

module.exports = router;
