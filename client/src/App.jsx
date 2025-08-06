import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';

import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';

import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Order from './pages/seller/Order';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';

import { useAppContext } from './context/AppContext';
import AdminRoute from './routes/AdminRoute';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';

const App = () => {
  const location = useLocation();
  const { showUserLogin, user, isDarkMode } = useAppContext();

  const isSellerPath = location.pathname.includes('seller');
  const isAdminPath = location.pathname.includes('admin');

  const isSeller = user?.role === 'seller';

  return (
    <div className={`text-default min-h-screen text-gray-700 bg-white transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      {!isSellerPath && !isAdminPath && <Navbar />}
      {showUserLogin && <Login />}
      <Toaster />

      <div className={`${!isSellerPath && !isAdminPath ? 'px-6 md:px-16 lg:px-24 xl:px-32' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Seller Routes */}
          <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={<AddProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Order />} />
          </Route>

          {/* Admin Routes (Protected) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="products" element={<ManageProducts />} />
          </Route>
        </Routes>
      </div>

      {!isSellerPath && !isAdminPath && <Footer />}
    </div>
  );
};

export default App;
