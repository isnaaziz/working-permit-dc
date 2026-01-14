import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute component that protects routes from unauthorized access
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected component(s)
 * @param {string[]} props.allowedRoles - Optional array of roles allowed to access this route
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles are specified
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role || user.roles?.[0];
    if (!allowedRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
