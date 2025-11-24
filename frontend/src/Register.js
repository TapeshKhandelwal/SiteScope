import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const Register = ({ onSwitch, onOTPSent }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    firstName: '',
    lastName: '',
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

    // Validate passwords match
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.password2,
      formData.firstName,
      formData.lastName
    );

    if (result.success) {
      onOTPSent(formData.email);
    } else {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (result.errors) {
        // Handle Django validation errors
        errorMessage = Object.entries(result.errors)
          .map(([field, errors]) => {
            const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${fieldName}: ${Array.isArray(errors) ? errors.join(', ') : errors}`;
          })
          .join('. ');
      } else if (result.error) {
        errorMessage = result.error;
      } else if (result.message) {
        errorMessage = result.message;
      }
      
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h2>Create Account</h2>
          <p>Join SiteScope and start analyzing websites</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

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
              placeholder="Create a strong password"
              required
              disabled={loading}
              minLength="8"
            />
            <small className="form-hint">At least 8 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="auth-footer">
            Already have an account?{' '}
            <button type="button" className="link-button" onClick={() => onSwitch('login')}>
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

