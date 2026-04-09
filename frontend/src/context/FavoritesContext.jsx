import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const { user } = useContext(AuthContext);
  const { fetchData, postData, deleteData } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const data = await fetchData('favorites');
      setFavorites(data);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const toggleFavorite = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorited = favorites.some(fav => fav.id === product.id);

    try {
      if (isFavorited) {
        // Optimistic update
        setFavorites(favorites.filter(fav => fav.id !== product.id));
        await deleteData(`favorites/${product.id}`);
      } else {
        // Optimistic update
        setFavorites([...favorites, product]);
        await postData('favorites', { product_id: product.id });
      }
      
      // Sync with server completely
      loadFavorites();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      // Revert on error
      loadFavorites();
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loadingFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
