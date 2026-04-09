import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shopsea_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('shopsea_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      localStorage.removeItem('shopsea_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (userToken = token) => {
    if (!userToken) return;
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const response = await axios.get('http://localhost:8000/api/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user data", error);
      setToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:8000/api/auth/login', { email, password });
    const newToken = response.data.access_token;
    setToken(newToken);
    
    // Fetch user to check role
    const userData = await fetchUser(newToken);
    if (userData && userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const register = async (name, email, password) => {
    const response = await axios.post('http://localhost:8000/api/auth/register', { name, email, password });
    if(response.data) {
      await login(email, password);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="shopsea-loader-container">
        <div className="shopsea-loader-ring"></div>
        <span className="shopsea-loader-text">Shopsea</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
