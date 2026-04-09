import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Upload } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../apiConfig';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await axios.post(`${API_URL}/admin/products`, data);
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="admin-products p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Product Inventory</h2>
        <div className="flex gap-4">
          <div className="admin-search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search products..." />
          </div>
          <button className="add-btn flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      <div className="admin-card p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-8">Loading products...</td></tr>
            ) : products.map(product => (
              <tr key={product.id}>
                <td><img src={product.image_url} alt={product.name} className="product-thumbnail" /></td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold">{product.name}</span>
                    <span className="text-xs text-slate-500">{product.sku}</span>
                  </div>
                </td>
                <td><span className="admin-badge">{product.category}</span></td>
                <td className="font-bold">₹{product.price}</td>
                <td>
                  <span className={`stock-level ${product.stock < 10 ? 'low' : ''}`}>
                    {product.stock} pcs
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="action-icon edit"><Edit2 size={16} /></button>
                    <button className="action-icon delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-card">
            <h3>Add New Product</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-row flex gap-4">
                <div className="admin-form-group flex-1">
                  <label>Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="admin-form-group flex-1">
                  <label>Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
              </div>
              <div className="admin-form-group">
                <label>Image</label>
                <div className="admin-file-input">
                  <input type="file" id="prod-img" onChange={handleFileChange} />
                  <label htmlFor="prod-img" className="flex items-center justify-center gap-2">
                    <Upload size={18} /> Choose File
                  </label>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn submit">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
