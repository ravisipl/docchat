import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setIsAdmin(false);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    // Redirect admin users to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default UserRoute; 