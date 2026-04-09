import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import Receipt from '../components/Receipt';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { fetchData, loading } = useApi();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchData('orders/me');
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    };
    loadOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && orders.length === 0) {
    return <div className="container center-content">Loading orders...</div>;
  }

  return (
    <div className="orders-page container">
      
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track your orders and view receipts for all your purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item-card">
              <div className="order-main-info flex-between">
                <div>
                  <span className="order-id">Order ID: {order.id.slice(0, 8)}...</span>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-status-badge" data-status={order.status}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div className="order-preview flex">
                {order.items.slice(0, 3).map((item, idx) => (
                  <img key={idx} src={item.image_url} alt={item.name} className="order-thumb" />
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3} more</div>
                )}
              </div>

              <div className="order-footer flex-between">
                <span className="order-total">Total: ₹{order.total_price.toFixed(2)}</span>
                <button className="btn btn-white btn-sm" onClick={() => setSelectedOrder(order)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content receipt-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
            <Receipt order={selectedOrder} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
