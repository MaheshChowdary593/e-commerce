import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  BarChart3, 
  Settings, 
  LogOut,
  Layers
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { name: 'Categories', icon: <Layers size={20} />, path: '/admin/categories' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Coupons', icon: <Tag size={20} />, path: '/admin/coupons' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <ShoppingBag className="logo-icon" size={28} />
        <span className="logo-text">Shopsea Admin</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            end={item.path === '/admin'}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={() => window.location.href = '/'}>
          <LogOut size={20} />
          <span>Exit Admin</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
