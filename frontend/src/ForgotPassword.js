import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const ForgotPassword = ({ onBack, onSuccess }) => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first OTP input when step changes to 2
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess('Password reset code sent to your email!');
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);
    } else {
      const errorMessage = result.errors 
        ? Object.values(result.errors).flat().join(', ')
        : result.error || 'Failed to send reset code. Please try again.';
      setError(errorMessage);
    }

    setLoading(false);
  };

  const handleOTPChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.some(digit => digit === '')) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await resetPassword(email, otp.join(''), newPassword, confirmPassword);

    if (result.success) {
      setSuccess('Password reset successfully!');
      setTimeout(() => onSuccess(), 1500);
    } else {
      const errorMessage = result.errors 
        ? Object.values(result.errors).flat().join(', ')
        : result.error || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === 1 ? (
          <>
            <div className="auth-header">
              <div className="auth-icon">🔑</div>
              <h2>Forgot Password</h2>
              <p>Enter your email to receive a password reset code</p>
            </div>

            <form onSubmit={handleSendOTP} className="auth-form">
              {error && (
                <div className="auth-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              {success && (
                <div className="auth-success">
                  <span>✓</span> {success}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              <div className="auth-footer">
                <button type="button" className="link-button" onClick={onBack}>
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-icon">🔒</div>
              <h2>Reset Password</h2>
              <p>
                Enter the code sent to<br />
                <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="auth-form">
              {error && (
                <div className="auth-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              {success && (
                <div className="auth-success">
                  <span>✓</span> {success}
                </div>
              )}

              <div className="form-group">
                <label>Verification Code</label>
                <div className="otp-inputs" onPaste={handleOTPPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="otp-input"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Create a new password"
                  required
                  disabled={loading}
                  minLength="8"
                />
                <small className="form-hint">At least 8 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="auth-footer">
                <button type="button" className="link-button" onClick={() => setStep(1)}>
                  ← Change Email
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

