import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ isAuthRoute, isAdminOnly = false }) => {
  const { user, token } = useContext(AuthContext);
  
  // If this is an auth route (login/register) and user is logged in, redirect to home
  if (isAuthRoute && token) {
    return <Navigate to="/" replace />;
  }

  // If this is a protected route and user is NOT logged in, redirect to login
  if (!isAuthRoute && !token) {
    return <Navigate to="/login" replace />;
  }

  // If this is an admin-only route and user is NOT an admin, redirect to home
  if (isAdminOnly && user?.role !== 'admin') {
    console.warn("Unauthorized access attempt to admin route by:", user?.email);
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the requested route
  return <Outlet />;
};

export default ProtectedRoute;
