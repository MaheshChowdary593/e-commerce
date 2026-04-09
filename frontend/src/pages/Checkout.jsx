import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useApi } from '../hooks/useApi';
import { AuthContext } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { postData, loading } = useApi();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState('717 Market Street, San Francisco, CA 94103');

  const handlePayment = async () => {
    try {
      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      // 1. Create Order on Backend
      const orderData = {
        total_price: cartTotal,
        email: user?.email || "guest@example.com",
        shipping_address: address,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || "N/A",
          name: item.name,
          image_url: item.image_url
        }))
      };

      const razorpayOrder = await postData('payment/create-order', orderData);

      // 2. Open Razorpay Modal
      const options = {
        key: "rzp_test_YOUR_KEY_ID", // This should be from env in a real app
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Shopsea",
        description: "Test Transaction",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          // 3. Verify Payment
          try {
            await postData('payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            clearCart();
            alert("Payment Successful!");
            navigate('/orders');
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#1a1a1a"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment initiation failed", err);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="checkout-page container">
      <div className="breadcrumb">Checkout <strong>/ Order</strong></div>
      
      <div className="checkout-layout">
        <div className="payment-form">
          <h1>Complete your payment</h1>
          <p>Confirm your shipping address and proceed to secure payment with Razorpay.</p>
          
          <div className="address-section">
            <h4>Shipping Address</h4>
            <textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="address-input"
            />
          </div>

          <div className="checkout-actions flex-between">
             <button className="btn btn-white" onClick={() => navigate('/')}>Home</button>
             <button 
               className="btn btn-primary pay-btn" 
               onClick={handlePayment}
               disabled={loading || cart.length === 0}
             >
               {loading ? 'Processing...' : `Pay ₹${cartTotal.toFixed(2)} Now`}
             </button>
          </div>
        </div>

        <div className="order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-items">
             {cart.map(item => (
               <div key={item.id} className="summary-item flex-between">
                  <div className="flex item-info">
                    <img src={item.image_url} alt={item.name} />
                    <div>
                      <h5>{item.name}</h5>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>
               </div>
             ))}
          </div>
          
          <div className="price-breakdown">
             <div className="flex-between"><span>Subtotal:</span><span>₹{cartTotal.toFixed(2)}</span></div>
             <div className="flex-between"><span>Shipping:</span><span>₹0.00</span></div>
             <div className="total flex-between"><span>Total:</span><span>₹{cartTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
