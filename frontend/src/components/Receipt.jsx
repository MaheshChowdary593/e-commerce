import React from 'react';
import './Receipt.css';

const Receipt = ({ order }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <div className="shop-logo">Shopsea</div>
        <h2>Order Receipt</h2>
        <p>Thank you for your purchase!</p>
      </div>

      <div className="receipt-info-grid">
        <div className="info-block">
          <label>Order ID</label>
          <div className="value">{order.id}</div>
        </div>
        <div className="info-block">
          <label>Date</label>
          <div className="value">{formatDate(order.created_at)}</div>
        </div>
        <div className="info-block">
          <label>Payment Method</label>
          <div className="value">Razorpay ({order.status === 'paid' ? 'Success' : 'Pending'})</div>
        </div>
        <div className="info-block">
          <label>Shipping To</label>
          <div className="value">{order.shipping_address}</div>
        </div>
      </div>

      <div className="receipt-items-table">
        <div className="table-header">
          <span>Product Details</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Price</span>
        </div>
        
        {order.items.map((item, idx) => (
          <div key={idx} className="table-row">
            <div className="item-desc">
              <span className="item-name">{item.name}</span>
              <span className="item-sku">SKU: {item.sku}</span>
            </div>
            <div className="text-center">x{item.quantity}</div>
            <div className="text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="receipt-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{order.total_price.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>₹0.00</span>
        </div>
        <div className="summary-row total">
          <span>Total Paid</span>
          <span>₹{order.total_price.toFixed(2)}</span>
        </div>
      </div>

      <div className="receipt-footer">
        <p>If you have any questions, please contact support@shopsea.com</p>
        <div className="transaction-id">ID: {order.razorpay_payment_id || 'N/A'}</div>
      </div>
      
      <button className="btn btn-primary print-hide" onClick={() => window.print()}>Print Receipt</button>
    </div>
  );
};

export default Receipt;
