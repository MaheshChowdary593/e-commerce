import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
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
            <h2>Sign In</h2>
            <p>Login to your Shopsea account</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="Enter your password" 
                required 
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>New to Shopsea? <Link to="/register">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
