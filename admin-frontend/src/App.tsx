import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import UserLayout from './components/layouts/UserLayout';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserRoute from './components/auth/UserRoute';

// Pages
import Login from './features/Auth/Login';
import Dashboard from './features/Dashboard/Dashboard';
import Users from './features/Users/Users';
import Documents from './features/Documents/Documents';
import Settings from './features/Settings/Settings';
import UserDashboard from './routes/user/UserDashboard';

const App: React.FC = () => {
  // Check if user is logged in and their role
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isAdmin = false;

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      isAdmin = user.is_admin || false;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirect root based on user role */}
        <Route 
          path="/" 
          element={
            token ? (
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/user" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/:folderId" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <UserRoute>
              <UserLayout />
            </UserRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Route>

        {/* Catch all route - redirect based on user role */}
        <Route 
          path="*" 
          element={
            token ? (
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/user" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App; 