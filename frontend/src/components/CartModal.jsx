import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CartModal.css';

const CartModal = ({ isOpen, onClose, cartItems = [], onRemove, onUpdateQuantity, total }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header flex-between">
          <h2>Your Cart ({cartItems.length} items)</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-items">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-row flex-between">
                  <div className="item-details flex">
                    <img src={item.image_url} alt={item.name} />
                    <div className="item-info">
                       <h3>{item.name}</h3>
                       <p className="item-price-unit">₹{item.price.toFixed(2)}</p>
                       <div className="quantity-controls">
                          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                       </div>
                    </div>
                  </div>
                  <div className="item-total">
                    <p className="total-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button className="remove-btn" onClick={() => onRemove(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={onClose}>Shop Now</button>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="order-total flex-between">
               <span>Subtotal</span>
               <span className="total-amount">₹{total.toFixed(2)}</span>
            </div>
            <button className="btn-checkout" onClick={() => {
              onClose();
              navigate('/checkout');
            }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
