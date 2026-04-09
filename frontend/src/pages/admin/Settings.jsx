import React, { useState } from 'react';
import { Save, Globe, Bell, Shield, CreditCard, Mail, Smartphone, Key, Lock, DollarSign } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="admin-settings">
      <div className="flex-between" style={{ marginBottom: '2.5rem', alignItems: 'flex-end' }}>
        <div>
          <h2 className="admin-title">System Settings</h2>
          <p className="admin-subtitle">Manage your storefront configuration and business rules.</p>
        </div>
        <button className="admin-btn admin-btn-primary">
          <Save size={20} /> Save Changes
        </button>
      </div>

      <div className="admin-settings-container">
        <div className="settings-nav">
          <div 
            className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Globe size={18} /> General Configuration
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notification Rules
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Access Control (RBAC)
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} /> Payment Gateways
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <>
              <div className="admin-card">
                <div className="card-header">
                   <div className="card-header-icon"><Globe size={20} /></div>
                   <h3 className="card-title">Site Information</h3>
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="admin-label">Display Name</label>
                    <input type="text" className="admin-input" defaultValue="Shopsea E-commerce" />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Admin Email</label>
                    <input type="email" className="admin-input" defaultValue="admin@shopsea.com" />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="admin-label">Footer Tagline</label>
                  <textarea className="admin-input" style={{ height: '120px', resize: 'none' }} defaultValue="Your premium destination for discovering and shopping the latest trends."></textarea>
                </div>
              </div>

              <div className="admin-card glass-dark">
                <div className="relative z-10">
                  <div className="card-header" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                     <div className="card-header-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><CreditCard size={20} /></div>
                     <h3 className="card-title" style={{ color: 'white' }}>Business Presets</h3>
                  </div>
                  
                  <div className="business-presets-grid">
                    <div className="preset-item">
                      <p className="preset-label">Tax (GST)</p>
                      <p className="preset-value">18.00<span className="preset-unit">%</span></p>
                    </div>
                    <div className="preset-item">
                      <p className="preset-label">Delivery Fee</p>
                      <p className="preset-value"><span className="preset-unit" style={{ marginRight: '4px' }}>₹</span>150</p>
                    </div>
                    <div className="preset-item">
                      <p className="preset-label">Default Currency</p>
                      <p className="preset-value">INR<span className="preset-unit" style={{ marginLeft: '8px' }}>₹</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="admin-card">
              <div className="card-header">
                 <div className="card-header-icon"><Bell size={20} /></div>
                 <h3 className="card-title">Notification Configuration</h3>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="admin-label flex-gap-2"><Mail size={16}/> System Emails</label>
                  <select className="admin-input">
                    <option>Enabled (Recommended)</option>
                    <option>Critical Only</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label flex-gap-2"><Smartphone size={16}/> SMS Alerts</label>
                  <select className="admin-input">
                    <option>Disabled</option>
                    <option>Enabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="admin-card">
              <div className="card-header">
                 <div className="card-header-icon"><Shield size={20} /></div>
                 <h3 className="card-title">Security & Access Control</h3>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="admin-label flex-gap-2"><Key size={16}/> Password Policy</label>
                  <select className="admin-input">
                    <option>Standard (8+ chars)</option>
                    <option>Strict (12+ chars, symbols)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label flex-gap-2"><Lock size={16}/> Two-Factor Auth (2FA)</label>
                  <select className="admin-input">
                    <option>Optional</option>
                    <option>Enforced for Admins</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="admin-card">
              <div className="card-header">
                 <div className="card-header-icon"><DollarSign size={20} /></div>
                 <h3 className="card-title">Payment Gateways</h3>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="admin-label">Razorpay Integration</label>
                  <select className="admin-input border-green-500">
                    <option>Active (Production)</option>
                    <option>Test Mode</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">Stripe Integration</label>
                  <select className="admin-input">
                    <option>Disabled</option>
                    <option>Test Mode</option>
                    <option>Active</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
