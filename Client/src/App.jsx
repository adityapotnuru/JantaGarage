import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Landing from './pages/Landing';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';

// Protected Route Guard
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
};

// Public Route Guard (Redirects to Home if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <main className="main-content">
                        <Routes>
                            {/* Public Landing Route */}
                            <Route path="/" element={<Landing />} />

                            {/* Protected Dashboard Route */}
                            <Route 
                                path="/dashboard" 
                                element={
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                } 
                            />

                            {/* Protected Complaint Routes */}
                            <Route 
                                path="/submit-complaint" 
                                element={
                                    <PrivateRoute>
                                        <SubmitComplaint />
                                    </PrivateRoute>
                                } 
                            />
                            <Route 
                                path="/my-complaints" 
                                element={
                                    <PrivateRoute>
                                        <MyComplaints />
                                    </PrivateRoute>
                                } 
                            />
                            <Route 
                                path="/complaints/:id" 
                                element={
                                    <PrivateRoute>
                                        <ComplaintDetails />
                                    </PrivateRoute>
                                } 
                            />

                            {/* Public Auth Routes */}
                            <Route 
                                path="/login" 
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                } 
                            />
                            <Route 
                                path="/signup" 
                                element={
                                    <PublicRoute>
                                        <Signup />
                                    </PublicRoute>
                                } 
                            />

                            {/* Fallback Route */}
                            <Route 
                                path="*" 
                                element={<Navigate to="/" replace />} 
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
