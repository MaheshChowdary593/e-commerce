import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart container">
        <h1>Your Cart is Empty</h1>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-dark">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Your Shopping Cart ({cart.length})</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="item-image">
                <img src={item.image_url} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-brand">{item.brand}</p>
                <div className="item-price-info">
                  <span className="current-price">₹{item.price.toLocaleString()}</span>
                  {item.original_price > item.price && (
                    <span className="original-price">₹{item.original_price.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="item-controls">
                <div className="quantity-picker">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="order-summary-sidebar">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="btn btn-dark checkout-btn">Proceed to Checkout</Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
