import React, { useState } from 'react';
import axios from 'axios';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/newsletter', { email });
      if (response.data.status === 'success') {
        alert(response.data.message || "Subscribed successfully!");
        setEmail('');
      } else {
        alert("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.detail || "An error occurred during subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top flex-between">
          <p>Subscribe for exclusive deals</p>
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
        <div className="footer-main grid">
          <div className="footer-brand">
            <h3 className="logo">Shopsea</h3>
            <div className="social-links flex">
              <a href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></a>
              <a href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.48.75 2.78 1.89 3.55-.7 0-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.79 3.42 4.19-.36.1-.73.15-1.12.15-.27 0-.54-.03-.8-.08.54 1.7 2.12 2.93 3.99 2.97-1.46 1.14-3.3 1.82-5.31 1.82-.35 0-.69-.02-1.03-.06 1.91 1.22 4.18 1.93 6.61 1.93 7.93 0 12.27-6.57 12.27-12.27 0-.19 0-.37-.01-.56.84-.61 1.57-1.37 2.15-2.23z"/></svg></a>
              <a href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Help</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Customer Service</a></li>
              <li><a href="#">How-to guides</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>About</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Sitemap</a></li>
              <li><a href="#">Subscriptions</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:support@leftnav.co">support@leftnav.co</a></li>
              <li><a href="tel:+18005550100">+1 800 555 0100</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
