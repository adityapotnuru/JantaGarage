import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import AllComplaints from './pages/AllComplaints';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

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

// Public Route Guard (Redirects to Dashboard if already logged in)
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
                <Routes>
                    {/* Public Landing Route */}
                    <Route 
                        path="/" 
                        element={
                            <PublicRoute>
                                <Landing />
                            </PublicRoute>
                        } 
                    />

                    {/* Protected Portal Layout Routes */}
                    <Route 
                        element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardOverview />} />
                        <Route path="/submit-complaint" element={<SubmitComplaint />} />
                        <Route path="/my-complaints" element={<MyComplaints />} />
                        <Route path="/complaints/:id" element={<ComplaintDetails />} />
                        <Route path="/all-complaints" element={<AllComplaints />} />
                        <Route path="/admin-users" element={<AdminUsers />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>

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

                    {/* Public Route (Charts restricted inside page logic) */}
                    <Route path="/reports" element={<Reports />} />

                    {/* Fallback Route */}
                    <Route 
                        path="*" 
                        element={<Navigate to="/" replace />} 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
