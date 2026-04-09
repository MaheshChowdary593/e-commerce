import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useApi } from '../hooks/useApi';
import { useFavorites } from '../hooks/useFavorites';
import './Header.css';

const Header = ({ cartCount = 0, onCartClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { query, setQuery, history, clearHistory } = useSearch();
  const { favorites } = useFavorites();
  const [showHistory, setShowHistory] = useState(false);
  const [categories, setCategories] = useState([]); // Added categories state
  const { fetchData, loading: apiLoading } = useApi(); // Added useApi hook
  const historyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Added useEffect to fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchData('categories', { _t: Date.now() });
        // Take top 6-8 categories to fit in header
        setCategories(data.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    loadCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (h) => {
    setQuery(h);
    navigate(`/search?q=${encodeURIComponent(h)}`);
    setShowHistory(false);
  };

  // Do not show full header on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Removed hardcoded categories array

  return (
    <header className="header">
      <div className="header-top">
        <div className="container flex-between">
          <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Shopsea</div>
          <div className="search-container" ref={historyRef}>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search products, categories, and brands" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
              />
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
            </form>
            
            {showHistory && history.length > 0 && (
              <div className="search-history-dropdown">
                <div className="history-header flex-between">
                  <span>Recent Searches</span>
                  <button onClick={clearHistory} className="clear-history-btn">Clear</button>
                </div>
                <ul className="history-list">
                  {history.map((h, i) => (
                    <li key={i} onClick={() => handleHistorySelect(h)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="header-actions">
            {!user ? (
              <Link to="/login" className="btn-profile">
                Login / Register
              </Link>
            ) : (
              <Link to="/profile" className="btn-profile">
                Profile
              </Link>
            )}
            
            {user && (
              <Link to="/favorites" className="btn-favorites" title="My Favorites">
                ❤️ {favorites.length > 0 && <span className="favorites-badge">{favorites.length}</span>}
              </Link>
            )}
            
            <Link to="/cart" className="btn-cart">
               Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-links flex">
            <li className={!location.search ? 'active' : ''}>
              <Link to="/">Home</Link>
            </li>
            {categories.map(cat => (
              <li key={cat.id || cat.name} className={location.search.includes(encodeURIComponent(cat.name)) ? 'active' : ''}>
                <Link to={`/search?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
              </li>
            ))}
            <li><Link to="/search?q=sale" className="sale-link">SALE</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
