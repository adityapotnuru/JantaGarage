const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const path = require('path');

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: '*', // We can specify Vite port like http://localhost:5173 but * is safe for local dev
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base route for sanity check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Caravan Chronicle API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
