import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    // Add a class to body for specific background if needed
    document.body.classList.add('success-page-active');
    return () => document.body.classList.remove('success-page-active');
  }, []);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <div className="success-icon-bg"></div>
          <CheckCircle className="success-icon" size={80} />
        </div>
        
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been placed successfully and is being processed.
        </p>
        
        {orderId && (
          <div className="order-info">
            <span>Order ID:</span>
            <strong>{orderId}</strong>
          </div>
        )}

        <div className="success-actions">
          <button 
            className="btn btn-primary btn-with-icon"
            onClick={() => navigate('/orders')}
          >
            <Package size={20} />
            View My Orders
            <ArrowRight size={18} className="arrow" />
          </button>
          
          <button 
            className="btn btn-outline btn-with-icon"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
            Back to Home
          </button>
        </div>

        <div className="success-footer">
          <p>A confirmation email has been sent to your registered address.</p>
          <p>Need help? <a href="/contact">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
