import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Assistant.css';

const API_BASE = 'http://localhost:8000/api';

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! 👋 I\'m your Shopsea assistant. Ask me to find products, add items to your cart, or get recommendations!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeAction = (data) => {
    const action = data.action;
    switch (action) {
      case 'SEARCH_PRODUCT': {
        const params = new URLSearchParams();
        if (data.query) params.set('q', data.query);
        if (data.filters?.category) params.set('category', data.filters.category);
        if (data.filters?.brand) params.set('brand', data.filters.brand);
        if (data.filters?.price_min) params.set('price_min', data.filters.price_min);
        if (data.filters?.price_max) params.set('price_max', data.filters.price_max);
        navigate(`/search?${params.toString()}`);
        return `🔍 Searching for "${data.query || data.product_name || 'products'}"...`;
      }
      case 'ADD_TO_CART': {
        const name = data.product_name || data.query || 'the product';
        if (data.index !== null && data.index !== undefined) {
          return `🛒 To add item #${data.index + 1} to your cart, please click the "Add to Cart" button on the product card.`;
        }
        return `🛒 To add "${name}" to your cart, please search for it first, then click "Add to Cart".`;
      }
      case 'REMOVE_FROM_CART': {
        navigate('/cart');
        return '🗑️ Opening your cart so you can remove items.';
      }
      case 'VIEW_CART': {
        navigate('/cart');
        return '🛒 Opening your cart now!';
      }
      case 'RECOMMEND_PRODUCTS': {
        navigate('/search?q=' + encodeURIComponent(data.query || 'recommended'));
        return `✨ Finding the best ${data.query || 'products'} for you!`;
      }
      default:
        return `I understood your request but I'm not sure how to handle that action: "${action}"`;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { type: 'user', text }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/assistant`, { message: text });
      const data = res.data;
      const actionMessage = executeAction(data);

      setMessages(prev => [
        ...prev,
        { type: 'action', text: actionMessage }
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { type: 'error', text: `❌ ${detail}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Find cheap shoes",
    "Show me jeans",
    "View my cart",
    "Best shirts for men"
  ];

  const handleQuickAction = (action) => {
    setInput(action);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <>
      <button className="assistant-fab" onClick={() => setIsOpen(!isOpen)} title="AI Assistant">
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {isOpen && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <div className="assistant-header-info">
              <div className="assistant-avatar">🤖</div>
              <div className="assistant-header-text">
                <h4>Shopsea AI</h4>
                <span>Always here to help</span>
              </div>
            </div>
            <button className="assistant-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="assistant-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`assistant-msg ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="assistant-quick-actions">
              {quickActions.map((qa, i) => (
                <button key={i} className="quick-action-btn" onClick={() => handleQuickAction(qa)}>
                  {qa}
                </button>
              ))}
            </div>
          )}

          <form className="assistant-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" className="assistant-send-btn" disabled={loading || !input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Assistant;
