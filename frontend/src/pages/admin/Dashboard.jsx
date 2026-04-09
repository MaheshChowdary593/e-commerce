import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { API_URL } from '../../apiConfig';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    total_orders: 0,
    total_revenue: 0,
    low_stock_products: 0,
    recent_orders: []
  });
  const [loading, setLoading] = useState(true);

  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 6890 },
    { name: 'Jun', sales: 4390 },
    { name: 'Jul', sales: 9490 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      name: 'Total Revenue', 
      value: `₹${dashboardData.total_revenue.toLocaleString()}`, 
      trend: '+12.5%', 
      icon: <ShoppingBag size={32} /> 
    },
    { 
      name: 'Total Orders', 
      value: dashboardData.total_orders.toString(), 
      trend: '+8.2%', 
      icon: <Package size={32} /> 
    },
    { 
      name: 'Total Users', 
      value: dashboardData.total_users.toString(), 
      trend: '+15.3%', 
      icon: <Users size={32} /> 
    },
    { 
      name: 'Low Stock', 
      value: dashboardData.low_stock_products.toString(), 
      trend: '-2.4%', 
      icon: <Activity size={32} /> 
    },
  ];

  if (loading) return <div className="admin-loading">Loading dashboard metrics...</div>;

  return (
    <div className="admin-dashboard">
      <div className="flex-between" style={{ marginBottom: '2.5rem', alignItems: 'flex-end' }}>
        <div>
          <h2 className="admin-title">Executive Overview</h2>
          <p className="admin-subtitle">Real-time performance metrics for Shopsea.</p>
        </div>
        <div className="dashboard-toggle">
           <button className="toggle-btn active">Overview</button>
           <button className="toggle-btn">Reports</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card" style={{ boxShadow: 'var(--admin-shadow)' }}>
            <div className="card-overlay"></div>
            <div className="stat-icon-wrapper">
               {stat.icon}
            </div>
            <p className="stat-label">{stat.name}</p>
            <h3 className="stat-value">{stat.value}</h3>
            <div className="stat-footer">
               <span className="trend-badge">{stat.trend}</span>
               <span className="trend-text">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div className="admin-card">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '20px', background: 'var(--admin-indigo)', borderRadius: '2px' }}></div>
              Revenue Analytics
            </h3>
            <select className="admin-select">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
            </select>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#000000" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
           <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '4px', height: '20px', background: '#000000', borderRadius: '2px' }}></div>
                 Recent Orders
              </h3>
              <button className="view-all-link">View All <ArrowRight size={14} /></button>
           </div>
           
           <div className="activity-list">
              {dashboardData.recent_orders.length > 0 ? (
                dashboardData.recent_orders.map((order) => (
                  <div key={order.id} className="activity-item">
                     <div className="activity-icon">
                        <ShoppingBag size={18} />
                     </div>
                     <div className="activity-info">
                        <p className="activity-title">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="activity-user">{order.email.split('@')[0]}</p>
                     </div>
                     <div className="activity-amount">
                        <p className="amount-text">₹{order.total_price.toLocaleString()}</p>
                        <span className={`status-tag ${order.status === 'delivered' ? 'success' : 'warning'}`}>
                           {order.status}
                        </span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                   <Activity size={32} />
                   <p>No recent orders found</p>
                </div>
              )}
           </div>
           
           <div className="alert-box">
              <p className="alert-title">Stock Intelligence</p>
              <p className="alert-text">{dashboardData.low_stock_products} items are currently below safety threshold.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
