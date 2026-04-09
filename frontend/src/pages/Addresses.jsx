import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import './Addresses.css';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', details: '', isDefault: false });
  const { fetchData, postData, deleteData, putData, loading } = useApi();

  const loadAddresses = async () => {
    try {
      const data = await fetchData('addresses');
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.details) return;
    
    try {
      await postData('addresses', newAddress);
      
      setNewAddress({ name: '', details: '', isDefault: false });
      setShowForm(false);
      loadAddresses(); // Refresh from backend
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const setAsDefault = async (id) => {
    try {
      await putData(`addresses/${id}/default`);
      loadAddresses(); // Refresh from backend
    } catch (err) {
      console.error("Failed to set default", err);
    }
  };

  const removeAddress = async (id) => {
    try {
      await deleteData(`addresses/${id}`);
      loadAddresses(); // Refresh from backend
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  return (
    <div className="addresses-page container">
      
      <div className="addresses-header flex-between">
        <div>
          <h1>My Addresses</h1>
          <p>Manage your shipping and billing addresses.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Address'}
        </button>
      </div>

      {showForm && (
        <form className="address-form" onSubmit={handleAddAddress}>
          <h3>Add New Address</h3>
          <div className="form-group">
            <label>Address Label (e.g., Home, Work)</label>
            <input 
              type="text" 
              value={newAddress.name} 
              onChange={e => setNewAddress({...newAddress, name: e.target.value})}
              placeholder="Home"
              required
            />
          </div>
          <div className="form-group">
            <label>Full Address Details</label>
            <textarea 
              rows="3"
              value={newAddress.details}
              onChange={e => setNewAddress({...newAddress, details: e.target.value})}
              placeholder="123 Main St, City, State, VIP..."
              required
            ></textarea>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="isDefault"
              checked={newAddress.isDefault}
              onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})}
              style={{ width: 'auto' }}
            />
            <label htmlFor="isDefault" style={{ margin: 0 }}>Set as default address</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      )}

      {loading && addresses.length === 0 ? (
        <div className="container center-content" style={{ padding: '40px' }}>Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="no-addresses">
          <div className="icon">📍</div>
          <p>You haven't saved any addresses yet.</p>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map(address => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              <div className="address-card-header flex-between">
                <h4>{address.name} {address.isDefault && <span className="badge-default">Default</span>}</h4>
              </div>
              <p className="address-details">{address.details}</p>
              <div className="address-actions">
                {!address.isDefault && (
                  <button className="btn-text" onClick={() => setAsDefault(address.id)} disabled={loading}>Set as Default</button>
                )}
                <button className="btn-text text-danger" onClick={() => removeAddress(address.id)} disabled={loading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
