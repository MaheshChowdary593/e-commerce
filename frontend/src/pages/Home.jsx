import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApi } from '../hooks/useApi';
import { useCart } from '../hooks/useCart';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const SkeletonItem = () => (
  <div className="skeleton-item">
    <div className="skeleton-thumb"></div>
    <div className="skeleton-line"></div>
  </div>
);

const Home = () => {
  const { fetchData, loading } = useApi();
  const { addToCart } = useCart();
  const { user } = useContext(AuthContext);
  const [dbCategories, setDbCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [relatedCategories, setRelatedCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Fetch categories, products, and recommendations independently for guest resilience
      try {
        const cats = await fetchData('categories', { _t: Date.now() });
        setDbCategories(cats || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }

      try {
        const prods = await fetchData('products');
        setProducts(prods || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }

      try {
        const recs = await fetchData('products/recommendations');
        setRecommendations(recs || []);
      } catch (err) {
        console.warn("Failed to load recommendations", err);
      }

      if (user) {
        try {
          const history = await fetchData('search/history');
          setRecentSearches(history || []);
        } catch (err) {
          console.warn("Failed to load search history", err);
        }

        try {
          const related = await fetchData('search/related-categories');
          setRelatedCategories(related || []);
        } catch (err) {
          console.warn("Failed to load related categories", err);
        }
      }
    };
    loadData();
  }, [user]);

  const handleCategoryClick = (cat) => {
    navigate(`/search?category=${encodeURIComponent(cat.name)}`);
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container flex-between hero-container">
          <div className="hero-content">
            <span className="badge">New Arrival</span>
            <h1>Shopsea: Premium Tech & Fashion</h1>
            <p>Experience the future of shopping with lightning-fast delivery and curated collections.</p>
            <div className="hero-actions">
              <button className="btn btn-dark" onClick={() => navigate('/search')}>Shop Now</button>
              {!user ? (
                <>
                  <button className="btn btn-primary-hero" onClick={() => navigate('/login')}>Login</button>
                  <button className="btn btn-secondary-hero" onClick={() => navigate('/register')}>Register</button>
                </>
              ) : (
                <button className="btn btn-outline">Learn More</button>
              )}
            </div>
          </div>
          <div className="hero-image">
             <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" alt="Hero" loading="lazy" />
          </div>
        </div>
      </section>

      {user && recentSearches.length > 0 && (
        <section className="recent-searches-section container">
          <h2 className="section-title">Recent Searches</h2>
          <div className="search-chips">
            {recentSearches.map((query, idx) => (
              <button 
                key={idx} 
                className="search-chip"
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                {query}
              </button>
            ))}
          </div>
        </section>
      )}

      {user && relatedCategories.length > 0 && (
        <section className="related-categories-section container">
          <div className="section-header-alt">
            <h2 className="section-title">Pick up where you left off</h2>
            <p className="section-subtitle">Based on your recent searches</p>
          </div>
          <div className="category-grid">
            {relatedCategories.map((cat) => (
              <div key={cat.id} className="category-card" onClick={() => handleCategoryClick(cat)}>
                <div className="cat-image">
                  <img 
                    src={cat.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400'} 
                    alt={cat.name} 
                    loading="lazy" 
                  />
                </div>
                <h3>{cat.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="categories-section container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {loading ? (
            Array(6).fill(0).map((_, i) => <SkeletonItem key={i} />)
          ) : (
            dbCategories.map((cat) => (
              <div key={cat.id} className="category-card" onClick={() => handleCategoryClick(cat)}>
                <div className="cat-image">
                  <img 
                    src={cat.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400'} 
                    alt={cat.name} 
                    loading="lazy" 
                  />
                </div>
                <h3>{cat.name}</h3>
              </div>
            ))
          )}
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="recommended-section container">
          <div className="flex-between section-header">
             <h2 className="section-title">Recommended for You</h2>
          </div>
          <div className="product-grid">
            {recommendations.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      )}

      <section className="trending-section container">
        <div className="flex-between section-header">
           <h2 className="section-title">Trending Products</h2>
        </div>
        <div className="product-grid">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonItem key={i} />)
          ) : (
            products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
