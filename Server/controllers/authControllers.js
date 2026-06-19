const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'citizen',
            phone: phone || '',
            address: address || ''
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return user info and token
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account deactivated. Please contact admin.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Return user info and token
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is populated by authMiddleware
        res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                phone: req.user.phone,
                address: req.user.address,
                isActive: req.user.isActive
            }
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error.message);
        res.status(500).json({ message: 'Server error retrieving users list' });
    }
};

const toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent self-deactivation
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Toggle user active error:', error.message);
        res.status(500).json({ message: 'Server error updating user status' });
    }
};

const updateUserRole = async (req, res) => {
    const { role } = req.body;
    if (!['citizen', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent changing oneself's admin role to avoid lockout
        if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ message: 'You cannot change your own admin role' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: `User role updated to ${role} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user role error:', error.message);
        res.status(500).json({ message: 'Server error updating user role' });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    getAllUsers,
    toggleUserActive,
    updateUserRole
};
