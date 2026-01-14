import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Fallback: clear potentially corrupt storage
      try { authService.logout(); } catch (e) { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const result = await authService.register(userData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    authService.logout();
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user?.accessToken;
  }, [user]);

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated,
    isVisitor: user?.role === 'VISITOR',
    isPIC: user?.role === 'PIC',
    isManager: user?.role === 'MANAGER',
    isSecurity: user?.role === 'SECURITY',
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
