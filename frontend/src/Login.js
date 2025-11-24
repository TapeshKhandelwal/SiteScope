import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const Login = ({ onSwitch, onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      onSuccess();
    } else {
      const errorMessage = result.errors 
        ? Object.values(result.errors).flat().join(', ')
        : result.error || 'Login failed. Please try again.';
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your SiteScope account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="button" className="link-button forgot-password-link" onClick={() => onSwitch('forgot-password')}>
            Forgot Password?
          </button>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="auth-footer">
            Don't have an account?{' '}
            <button type="button" className="link-button" onClick={() => onSwitch('register')}>
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

