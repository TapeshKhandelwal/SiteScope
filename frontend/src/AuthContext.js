import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from './config';

const AuthContext = createContext(null);

// Helper function to get CSRF token from cookies
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Helper function to get CSRF token
const getCSRFToken = () => {
  return getCookie('csrftoken');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize CSRF token and check auth status
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // First, get CSRF token
      await fetch(`${API_URL}/api/csrf/`, {
        credentials: 'include',
      });
      
      // Then check if user is logged in
      await checkAuthStatus();
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/user/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, password2, firstName = '', lastName = '') => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          password,
          password2,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendOTP = async (email, otpType = 'registration') => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/resend-otp/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          otp_type: otpType,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const csrfToken = getCSRFToken();
      await fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email, otpCode, newPassword, newPassword2) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${API_URL}/api/auth/reset-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          new_password: newPassword,
          new_password2: newPassword2,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

