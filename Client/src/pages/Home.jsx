import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>JantaGarage</h1>
                <button onClick={logout} className="btn-logout">
                    Logout
                </button>
            </header>
            
            <main className="home-main">
                <div className="profile-card">
                    <h3>Welcome, {user?.name || 'User'}!</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> <span className="role-tag">{user?.role}</span></p>
                    {user?.phone && <p><strong>Phone:</strong> {user?.phone}</p>}
                    {user?.address && <p><strong>Address:</strong> {user?.address}</p>}
                </div>
            </main>
        </div>
    );
};

export default Home;
