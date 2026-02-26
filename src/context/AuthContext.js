import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (organizationId, email, password) => {
    try {
      const response = await api.post('/auth/login', { organizationId, email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      console.error('Login error:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      // Validate required fields on frontend
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.companyName) {
        const errorMsg = 'Please fill in all required fields';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Registration successful! Let\'s get you set up.', {
        duration: 4000,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      console.error('Registration error:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super Admin has all permissions
    if (user.role === 'Super Admin') return true;
    
    // Permission matrix
    const permissions = {
      'Company Owner': ['*'],
      'Operations Manager': [
        'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.delete',
        'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
        'customers.view', 'customers.create', 'customers.edit',
        'estimates.view', 'estimates.create', 'estimates.edit',
        'invoices.view', 'invoices.create', 'invoices.edit',
        'reports.view', 'users.view', 'users.invite',
        'work.view', 'work.manage',
        'inbox.view'
      ],
      'Estimator': [
        'jobs.view', 'customers.view', 'customers.create', 'customers.edit',
        'estimates.view', 'estimates.create', 'estimates.edit', 'estimates.delete',
        'work.view',
        'inbox.view'
      ],
      'Accountant': [
        'jobs.view', 'customers.view', 'invoices.view', 'invoices.create',
        'invoices.edit', 'invoices.delete', 'reports.view',
        'work.view',
        'inbox.view'
      ],
      'Staff': [
        'jobs.view', 'schedules.view', 'jobs.edit',
        'work.view',
        'inbox.view'
      ],
      'Client': [
        'jobs.view', 'invoices.view', 'schedules.view',
        'work.view',
        'inbox.view'
      ]
    };

    const userPermissions = permissions[user.role] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        hasPermission,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};