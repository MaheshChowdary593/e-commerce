import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApi } from '../hooks/useApi';
import { useCart } from '../hooks/useCart';
import './SearchPage.css';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-text short"></div>
    <div className="skeleton-text long"></div>
  </div>
);

const SearchPage = () => {
  const { fetchData, postData, loading } = useApi();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [aiFilters, setAiFilters] = useState(null);
  const [sortBy, setBy] = useState('popularity');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const priceMin = searchParams.get('price_min') || '';
  const priceMax = searchParams.get('price_max') || '';
  const brand = searchParams.get('brand') || '';
  const mode = searchParams.get('mode') || 'standard';
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 40; // Increased limit to find enough items after filtering

  useEffect(() => {
    // Reset products and AI filters when search params change
    setProducts([]);
    setAiFilters(null);
    setPage(1);
    setHasMore(true);
  }, [query, category, priceMin, priceMax, brand, mode]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        let results = [];
        const skip = (page - 1) * ITEMS_PER_PAGE;
        
        if (mode === 'ai' && query && page === 1) {
          // AI Mode: Call the POST endpoint for parsing + searching
          // Note: Pagination for AI special mode is handled differently in this simplified version
          const response = await postData('api/search-ai', { query, user_id: null });
          results = response.products;
          setAiFilters(response.filters);
          setHasMore(false); // AI search is currently single-page
        } else {
          // Standard Mode
          const params = { limit: ITEMS_PER_PAGE, skip };
          if (query) params.q = query;
          if (category) params.category = category;
          if (priceMin) params.price_min = priceMin;
          if (priceMax) params.price_max = priceMax;
          if (brand) params.brand = brand;
          
          results = await fetchData('products/search', params);
          if (results.length === 0 || results.length < ITEMS_PER_PAGE / 2) {
            setHasMore(false);
          }
        }
        
        setProducts(prev => page === 1 ? results : [...prev, ...results]);
      } catch (err) {
        console.error("SearchPage error:", err);
      }
    };
    loadResults();
  }, [query, category, priceMin, priceMax, brand, mode, page]);

  // Infinite Scroll logic
  const loaderRef = React.useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        console.log("Bottom reached, loading more...");
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, hasMore]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, sortBy]);

  return (
    <div className="search-page container">
      <div className="search-header flex-between">
        <div className="title-area">
          <h1>
            {query ? `Results for "${query}"` : (category ? category : 'All Products')}
          </h1>
        </div>
        <button className={`btn-filter-toggle ${isFiltersVisible ? 'active' : ''}`} onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9v7l4 3v-10L22 3z"/></svg>
          Filters
        </button>
      </div>

      <div className={`search-layout ${isFiltersVisible ? 'show-filters' : ''}`}>
        <aside className="filters-sidebar">
          <div className="sidebar-header flex-between">
            <h3>Filters & Sorting</h3>
            <button className="close-filters" onClick={() => setIsFiltersVisible(false)}>&times;</button>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <div className="sidebar-sort-options">
               <div className={`sort-item ${sortBy === 'popularity' ? 'active' : ''}`} onClick={() => setBy('popularity')}>Popularity</div>
               <div className={`sort-item ${sortBy === 'price-low' ? 'active' : ''}`} onClick={() => setBy('price-low')}>Price: Low to High</div>
               <div className={`sort-item ${sortBy === 'price-high' ? 'active' : ''}`} onClick={() => setBy('price-high')}>Price: High to Low</div>
               <div className={`sort-item ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => setBy('rating')}>Rating</div>
            </div>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
               <input type="number" placeholder="Min" />
               <input type="number" placeholder="Max" />
            </div>
          </div>
          <div className="filter-group">
            <label>Ratings</label>
            <div className="rating-filters">
               {[4, 3, 2].map(r => (
                 <div key={r} className="check-item">
                    <input type="checkbox" id={`r-${r}`} />
                    <label htmlFor={`r-${r}`}>{r}★ & above</label>
                 </div>
               ))}
            </div>
          </div>
          <button className="btn btn-dark apply-filters" onClick={() => setIsFiltersVisible(false)}>Apply</button>
        </aside>

        <main className="results-main">
          {aiFilters && (
            <div className="ai-filters-chips">
              <span className="chips-label">AI Extracted Filters:</span>
              <div className="chips-list">
                {aiFilters.category && <span className="chip">Category: {aiFilters.category}</span>}
                {aiFilters.brand && <span className="chip">Brand: {aiFilters.brand}</span>}
                {(aiFilters.price_min || aiFilters.price_max) && (
                  <span className="chip">
                    Price: {aiFilters.price_min || 0} - {aiFilters.price_max || 'Any'}
                  </span>
                )}
                {aiFilters.color && <span className="chip">Color: {aiFilters.color}</span>}
                {aiFilters.size && <span className="chip">Size: {aiFilters.size}</span>}
                {aiFilters.rating_min && <span className="chip">Rating: {aiFilters.rating_min}+</span>}
                {aiFilters.features?.map(f => (
                  <span key={f} className="chip feature">{f}</span>
                ))}
                {aiFilters.sort_by && <span className="chip sort">Sort: {aiFilters.sort_by}</span>}
              </div>
            </div>
          )}

          <div className="product-grid-container">
            <div className="product-grid">
               {loading && page === 1 ? (
                 Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
               ) : (
                 products.length > 0 ? (
                   sortedProducts.map(product => (
                     <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                   ))
                 ) : (
                   !loading && (
                     <div className="empty-state">
                        <p>No products found {query ? `for "${query}"` : `in "${category}"`}.</p>
                     </div>
                   )
                 )
               )}
            </div>
            
            <div ref={loaderRef} className="infinite-scroll-sentinel">
              {loading && page > 1 && (
                <div className="scroll-loading-spinner">
                   <span>Loading more...</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
