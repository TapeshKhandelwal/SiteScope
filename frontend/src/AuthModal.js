import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import './Auth.css';

const AuthModal = ({ onClose }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'otp', 'forgot-password'
  const [registrationEmail, setRegistrationEmail] = useState('');

  const handleOTPSent = (email) => {
    setRegistrationEmail(email);
    setView('otp');
  };

  const handleSuccess = () => {
    onClose();
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <Login
            onSwitch={(view) => setView(view)}
            onSuccess={handleSuccess}
          />
        );
      case 'register':
        return (
          <Register
            onSwitch={(view) => setView(view)}
            onOTPSent={handleOTPSent}
          />
        );
      case 'otp':
        return (
          <OTPVerification
            email={registrationEmail}
            onSuccess={handleSuccess}
            onBack={() => setView('register')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={() => setView('login')}
            onSuccess={() => {
              setView('login');
              // Could show a success message here
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {renderView()}
      </div>
    </div>
  );
};

export default AuthModal;

