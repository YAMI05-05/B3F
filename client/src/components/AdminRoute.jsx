import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../Context/AppContext';

const AdminRoute = ({ children }) => {
  const { user } = useAppContext();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
