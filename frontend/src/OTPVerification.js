import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';

const OTPVerification = ({ email, onSuccess, onBack }) => {
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
    
    // Auto-submit
    handleSubmit(pastedData);
  };

  const handleSubmit = async (otpCode = null) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    const result = await verifyOTP(email, code);

    if (result.success) {
      setSuccess('Email verified successfully!');
      setTimeout(() => onSuccess(), 1000);
    } else {
      setError(result.error || 'Invalid or expired OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    const result = await resendOTP(email, 'registration');

    if (result.success) {
      setSuccess('New OTP sent to your email!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Failed to resend OTP. Please try again.');
    }

    setResending(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p>
            We've sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className="auth-form">
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

          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                disabled={loading || resending}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="auth-button"
            disabled={loading || otp.some(digit => digit === '')}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="auth-footer" style={{ flexDirection: 'column', gap: '10px' }}>
            <div>
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span className="countdown">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  className="link-button"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
            <button type="button" className="link-button" onClick={onBack}>
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

