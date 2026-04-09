import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css'; // Reusing Login styles for consistency

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-info-side">
        {/* Background decorative elements */}
        <div className="auth-info-circle" style={{ width: '300px', height: '300px', top: '-10%', right: '-10%' }}></div>
        <div className="auth-info-circle" style={{ width: '500px', height: '500px', bottom: '-20%', left: '-20%' }}></div>
        
        <h1 className="auth-info-title">Welcome to Shopsea</h1>
        <p className="auth-info-subtitle">
          Your premium destination for discovering and shopping the latest trends, 
          exclusive collections, and unbeatable daily deals.
        </p>
        
        <ul className="auth-info-list">
          <li>
            <span className="auth-info-icon">✓</span>
            Fast, Free Shipping
          </li>
          <li>
            <span className="auth-info-icon">✓</span>
            Secure Payments
          </li>
          <li>
            <span className="auth-info-icon">✓</span>
            24/7 Dedicated Support
          </li>
          <li>
            <span className="auth-info-icon">✓</span>
            Easy Returns
          </li>
        </ul>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join Shopsea to start shopping</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password" 
                required 
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password" 
                required 
                minLength={6}
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
