import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user, token]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cart`);
      const mappedCart = response.data.map(item => ({
        ...item,
        id: item.product_id
      }));
      setCart(mappedCart);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const existingItem = cart.find(item => item.product_id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
      
      await axios.post(`${API_URL}/cart`, {
        product_id: product.id,
        quantity: newQuantity
      });
      
      await loadCart();

      // Toast notification
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.innerText = `Added ${product.name} to cart`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/${productId}`);
      await loadCart();
    } catch (err) {
      console.error("Failed to remove from cart", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.post(`${API_URL}/cart`, {
        product_id: productId,
        quantity: Math.max(1, quantity)
      });
      await loadCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart`);
      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
