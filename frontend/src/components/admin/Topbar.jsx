import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, X, Box, PieChart, Settings as SettingsIcon, Users, ShoppingBag, Tag, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: <PieChart size={14} />, desc: 'Executive overview and metrics' },
  { name: 'Products', path: '/admin/products', icon: <Box size={14} />, desc: 'Manage inventory and pricing' },
  { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={14} />, desc: 'Process and track shipments' },
  { name: 'Users', path: '/admin/users', icon: <Users size={14} />, desc: 'Customer accounts and permissions' },
  { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={14} />, desc: 'Discount codes and promotions' },
  { name: 'Analytics', path: '/admin/analytics', icon: <PieChart size={14} />, desc: 'Detailed sales reports' },
  { name: 'Categories', path: '/admin/categories', icon: <Layers size={14} />, desc: 'Product taxonomy setup' },
  { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={14} />, desc: 'System configuration and presets' },
];

const Topbar = ({ title, userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const filteredLinks = adminLinks.filter(link => 
    link.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      
      <div className="topbar-right">
        <div className="search-wrapper" ref={searchRef}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search panels, settings, orders..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}

          {/* Search Dropdown */}
          {isDropdownOpen && searchQuery && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Links</span>
              </div>
              {filteredLinks.length > 0 ? (
                <div className="search-results">
                  {filteredLinks.map((link) => (
                    <div 
                      key={link.name} 
                      className="search-result-item"
                      onClick={() => handleLinkClick(link.path)}
                    >
                      <div className="search-result-icon">{link.icon}</div>
                      <div className="search-result-info">
                        <p className="search-result-name">{link.name}</p>
                        <p className="search-result-desc">{link.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-empty">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="admin-profile">
          <div className="profile-avatar">
            <User size={24} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{userProfile?.name || 'Admin User'}</span>
            <span className="profile-role">{userProfile?.role || 'Administrator'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
