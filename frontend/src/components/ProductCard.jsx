import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);
  const hasDiscount = product.discount_percentage > 0;

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)} style={{cursor: 'pointer'}}>
      <div className="product-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        
        <button 
          className={`favorite-btn ${favorited ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          {favorited ? '❤️' : '♡'}
        </button>

        {hasDiscount && (
          <div className="discount-badge">-{product.discount_percentage}%</div>
        )}
        <div className="add-to-cart-container">
          <button className="add-to-cart-btn" onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}>
            Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="price-container">
          <p className="product-price">₹{Number(product.price).toFixed(2)}</p>
          {hasDiscount && (
            <p className="original-price">₹{Number(product.original_price).toFixed(2)}</p>
          )}
        </div>
        <div className="product-meta">
          <span className="rating">⭐ {product.rating} ({product.reviews_count})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
