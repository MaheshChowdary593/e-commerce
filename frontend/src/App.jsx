import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CartModal from './components/CartModal'
import Home from './pages/Home'
import SearchPage from './pages/SearchPage'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { useCart } from './hooks/useCart'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Addresses from './pages/Addresses'
import Favorites from './pages/Favorites'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminCoupons from './pages/admin/Coupons'
import AdminAnalytics from './pages/admin/Analytics'
import AdminSettings from './pages/admin/Settings'
import PaymentSuccess from './pages/PaymentSuccess'
import Assistant from './components/Assistant'
import './App.css'

function App() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const location = useLocation()

  // Define routes where the Assistant should be hidden
  const hideAssistantPaths = ['/cart', '/checkout', '/favorites', '/payment']
  const isAdminPath = location.pathname.startsWith('/admin')
  const shouldHideAssistant = isAdminPath || hideAssistantPaths.includes(location.pathname)


  return (
    <div className="app">
      <Routes>
        {/* Admin Routes (No Header/Footer) */}
        <Route path="/admin" element={<ProtectedRoute isAuthRoute={false} isAdminOnly={true} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="categories" element={<div className="p-8"><h2 className="text-2xl font-bold">Category Management</h2></div>} />
          </Route>
        </Route>

        {/* Storefront Routes (With Header/Footer) */}
        <Route path="*" element={
          <>
            <Header cartCount={cart.length} />
            <main className="content">
              <Routes>
                {/* Public Routes (Accessible by everyone) */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />

                {/* Auth Routes (Login/Register) - Redirect to home if logged in */}
                <Route element={<ProtectedRoute isAuthRoute={true} />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                
                {/* Protected Routes (Require login) */}
                <Route element={<ProtectedRoute isAuthRoute={false} />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
      {!shouldHideAssistant && <Assistant />}
    </div>
  )
}

export default App
