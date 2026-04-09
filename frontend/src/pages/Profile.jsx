import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="profile-page container">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="user-info-card">
            <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
            <h3>{user.name || 'User'}</h3>
            <p>{user.email}</p>
          </div>
          
          <nav className="profile-nav">
            <Link to="/profile" className="active">Dashboard</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/addresses">Addresses</Link>
            <Link to="/favorites">Favorites</Link>
            <button onClick={logout} className="logout-btn-sidebar">Logout</button>
          </nav>
        </aside>

        <main className="profile-content">
          <div className="welcome-banner">
            <h1>Welcome back, {user.name || 'Shopper'}!</h1>
            <p>From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
          </div>

          <div className="activity-grid">
            <div className="activity-card" onClick={() => navigate('/orders')}>
              <div className="icon">📦</div>
              <h4>Total Orders</h4>
              <p>View your order history</p>
            </div>
            <div className="activity-card" onClick={() => navigate('/addresses')}>
              <div className="icon">📍</div>
              <h4>Addresses</h4>
              <p>Manage your shipping details</p>
            </div>
            <div className="activity-card" onClick={() => navigate('/favorites')}>
              <div className="icon">❤️</div>
              <h4>Favorites</h4>
              <p>View your saved products</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
