import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import ProductCard from '../components/ProductCard';
import { useCart } from '../hooks/useCart';

const Favorites = () => {
  const { favorites, loadingFavorites } = useFavorites();
  const { addToCart } = useCart();

  return (
    <div className="favorites-page container" style={{ padding: '40px 0', minHeight: '60vh' }}>
      
      <div className="favorites-header flex-between" style={{ marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Favorites</h1>
          <p style={{ color: '#666' }}>Products you've saved all in one place.</p>
        </div>
      </div>

      {loadingFavorites && favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading your favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="no-favorites" style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ccc' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>❤️</div>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>You haven't favored any products yet.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'} style={{ marginTop: '20px' }}>Explore Products</button>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map(item => (
            <ProductCard key={item.id} product={item} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
