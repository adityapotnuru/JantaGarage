import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user, logout } = useAuth();

    return (
        <div className="landing-container">
            {/* Navigation Header */}
            <header className="landing-header">
                <div className="landing-brand">
                    <span className="brand-logo">🛠️</span>
                    <span className="brand-name">JantaGarage</span>
                </div>
                <nav className="landing-nav">
                    {user ? (
                        <>
                            <span className="nav-welcome">Hello, {user.name}</span>
                            <Link to="/dashboard" className="nav-btn nav-btn-primary">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="nav-btn nav-btn-outline">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn nav-btn-outline">
                                Login
                            </Link>
                            <Link to="/signup" className="nav-btn nav-btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Your Civic Workshop & Auto-Care Hub</h1>
                        <p>
                            Connect with local volunteers, request vehicle inspections, share workshop tools, and maintain community garages. Re-imagined for citizens, staff, and admin teams.
                        </p>
                        <div className="hero-ctas">
                            {user ? (
                                <Link to="/dashboard" className="cta-btn cta-primary">
                                    Go to your Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/signup" className="cta-btn cta-primary">
                                        Get Started for Free
                                    </Link>
                                    <Link to="/login" className="cta-btn cta-secondary">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <h2>Everything You Need in One Place</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">🚗</span>
                            <h3>Vehicle Services</h3>
                            <p>Schedule check-ups, inspections, and basic garage repairs with our registered staff.</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🔧</span>
                            <h3>Tool Sharing</h3>
                            <p>Borrow specialized automotive and repair tools from JantaGarage's shared workshop inventory.</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📢</span>
                            <h3>Civic Reporting</h3>
                            <p>Report neighborhood street repairs, potholes, or garage hazards directly to town staff.</p>
                        </div>
                    </div>
                </section>

                {/* Stats / Info Section */}
                <section className="stats-section">
                    <div className="stat-item">
                        <h4>10,000+</h4>
                        <p>Active Citizens</p>
                    </div>
                    <div className="stat-item">
                        <h4>50+</h4>
                        <p>Expert Mechanics</p>
                    </div>
                    <div className="stat-item">
                        <h4>15 mins</h4>
                        <p>Average Response Time</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} JantaGarage. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
