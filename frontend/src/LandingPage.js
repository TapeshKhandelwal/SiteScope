import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import './LandingPage.css';

const LandingPage = ({ onLoginSuccess }) => {
  const [view, setView] = useState('welcome'); // 'welcome', 'login', 'register', 'otp', 'forgot-password'
  const [registrationEmail, setRegistrationEmail] = useState('');

  const handleOTPSent = (email) => {
    setRegistrationEmail(email);
    setView('otp');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return (
          <div className="landing-container">
            <div className="landing-content">
              <div className="landing-logo">
                <div className="landing-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5.63604 5.63604L7.05025 7.05025" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.9497 16.9497L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h1 className="landing-title">SiteScope</h1>
              </div>

              <p className="landing-subtitle">
                Professional Website Analysis & Performance Insights
              </p>

              <div className="landing-features">
                <div className="feature-item">
                  <span className="feature-icon">🔍</span>
                  <div className="feature-text">
                    <h3>Deep Website Analysis</h3>
                    <p>Extract meta data, content, and links</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div className="feature-text">
                    <h3>Performance Insights</h3>
                    <p>Google PageSpeed metrics for desktop & mobile</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <div className="feature-text">
                    <h3>AI-Powered SEO</h3>
                    <p>Optimize titles, descriptions, and content</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💬</span>
                  <div className="feature-text">
                    <h3>SiteSense AI Assistant</h3>
                    <p>Chat about your website analysis</p>
                  </div>
                </div>
              </div>

              <div className="landing-actions">
                <button 
                  className="landing-btn landing-btn-primary"
                  onClick={() => setView('register')}
                >
                  Get Started Free
                </button>
                <button 
                  className="landing-btn landing-btn-secondary"
                  onClick={() => setView('login')}
                >
                  Sign In
                </button>
              </div>

              <p className="landing-footer-text">
                Join hundreds of users analyzing their websites
              </p>
            </div>
          </div>
        );

      case 'login':
        return (
          <Login
            onSwitch={(view) => setView(view)}
            onSuccess={onLoginSuccess}
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
            onSuccess={onLoginSuccess}
            onBack={() => setView('register')}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={() => setView('login')}
            onSuccess={() => setView('login')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="landing-page">
      {renderView()}
    </div>
  );
};

export default LandingPage;

