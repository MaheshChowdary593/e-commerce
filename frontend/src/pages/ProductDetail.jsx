import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApi } from '../hooks/useApi';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchData, loading } = useApi();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  
  const favorited = product ? isFavorite(product.id) : false;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchData(`products/${slug}`);
        setProduct(data);
        setSelectedImage(data.image_url);
        
        // Fetch similar products from the same category
        if (data.category) {
          const similar = await fetchData('products', { 
            category: data.category,
            limit: 11 
          });
          // Filter out the current product
          setSimilarProducts(similar.filter(p => p.id !== data.id).slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading || !product) return <div className="container" style={{padding: '5rem'}}>Loading product details...</div>;


  return (
    <div className="product-detail container">
      <div className="detail-layout">
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={selectedImage} alt={product.name} className="main-image" />
            {product.discount_percentage > 0 && (
              <div className="detail-discount-badge">-{product.discount_percentage}% OFF</div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-list">
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.name} ${i}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-actions">
          <span className="brand-label">{product.brand || 'Premium Quality'}</span>
          <h1>{product.name}</h1>
          <div className="rating">
             <span className="stars">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5-Math.round(product.rating))}</span>
             <span className="reviews">({product.reviews_count} Reviews)</span>
          </div>
          
          <div className="price-tag flex">
             <span className="current-price">₹{Number(product.price).toFixed(2)}</span>
             {product.original_price > product.price && (
               <span className="old-price">₹{Number(product.original_price).toFixed(2)}</span>
             )}
          </div>

          <p className="description">{product.description}</p>

          <div className="product-meta-specs">
             <div className="meta-item"><strong>Category:</strong> {product.category}</div>
             <div className="meta-item"><strong>Manufacturer:</strong> {product.brand || 'Premium Brand'}</div>
          </div>

          <div className="action-row flex-between">
             <div className="quantity-selector flex">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
               <input type="number" value={quantity} readOnly />
               <button onClick={() => setQuantity(quantity + 1)}>+</button>
             </div>
             
             <button className="btn btn-dark add-btn" onClick={() => addToCart({ ...product, quantity })}>
               Add to Cart
             </button>
             
             <button 
               className={`detail-favorite-btn ${favorited ? 'active' : ''}`}
               onClick={() => toggleFavorite(product)}
               title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
             >
               {favorited ? '❤️' : '♡'}
             </button>
          </div>
          
          <div className="shipping-info">
             <p>✓ Free delivery on orders over ₹50</p>
             <p>✓ 30-day easy returns</p>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="shop-similar">
           <h2 className="section-title">Shop similar items</h2>
           <div className="product-grid">
              {similarProducts.map(item => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} />
              ))}
           </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
