import React, { useState, useEffect } from 'react';
import { Search, FileText, ExternalLink, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../apiConfig';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      setOrders(response.data.recent_orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders/invoice/${orderId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <div className="admin-orders p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex gap-4">
          <div className="admin-search-bar">
            <Search size={18} />
            <input type="text" placeholder="Filter by ID or Email..." />
          </div>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <Calendar size={18} /> Last 30 Days
          </button>
        </div>
      </div>

      <div className="admin-card p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-8">Loading orders...</td></tr>
            ) : orders.map(order => (
              <tr key={order.id}>
                <td className="font-bold">#{order.id.slice(0, 8)}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold">{order.email}</span>
                  </div>
                </td>
                <td className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <select 
                    className={`status-select status-${order.status}`}
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="font-bold">₹{order.total_price}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="action-icon" onClick={() => downloadInvoice(order.id)} title="Invoice">
                      <FileText size={18} className="text-black" />
                    </button>
                    <button className="action-icon" title="Details">
                      <ExternalLink size={18} className="text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
