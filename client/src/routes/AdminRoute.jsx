import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const AdminRoute = ({ children }) => {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token but no user (still loading)
    const token = localStorage.getItem("token");
    if (token && !user) {
      // Wait a bit for the context to load user data
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
