import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('search_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const performSearch = useCallback(async (searchQuery, userId = null) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search`, {
        params: { q: searchQuery, user_id: userId }
      });
      setResults(response.data);
      
      // Update local history
      setHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) performSearch(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, performSearch]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  return { query, setQuery, results, loading, history, clearHistory, performSearch };
};
