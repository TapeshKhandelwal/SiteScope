import React, { useState } from 'react';
import './App.css';
import AIOptimizer from './AIOptimizer';
import AIChatbot from './AIChatbot';
import LandingPage from './LandingPage';
import { useAuth } from './AuthContext';

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

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="App">
        <div className="auth-loading-container">
          <div className="auth-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="auth-loading-text">Loading SiteScope...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return <LandingPage onLoginSuccess={() => {/* Auth context handles this */}} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setScrapedData(null);
    setActiveTab('overview');

    try {
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch('/api/scrape/', {
        method: 'POST',
        credentials: 'include', // Important: Send cookies with request
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '', // Include CSRF token
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setScrapedData(result.data);
        setError('');
      } else {
        setError(result.message || 'Failed to scrape website');
        setScrapedData(null);
      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure Django server is running on port 8000.');
      console.error('Error:', err);
      setScrapedData(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#0cce6b';
    if (score >= 50) return '#ffa400';
    return '#ff4e42';
  };

  const formatMetric = (value) => {
    if (!value) return 'N/A';
    return `${(value / 1000).toFixed(2)}s`;
  };

  const ScoreCircle = ({ score, label }) => (
    <div className="score-circle-container">
      <div className="score-circle" style={{ '--score-color': getScoreColor(score) }}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="score-bg"></circle>
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            className="score-fill"
            style={{
              strokeDasharray: `${score * 2.827}, 282.7`,
              stroke: getScoreColor(score)
            }}
          ></circle>
        </svg>
        <div className="score-value">{score}</div>
      </div>
      <div className="score-label">{label}</div>
    </div>
  );

  const PageSpeedSection = ({ data, strategy }) => {
    if (!data || data.error) {
      return (
        <div className="pagespeed-error">
          <p>⚠️ {data?.error || 'No data available'}</p>
        </div>
      );
    }

    return (
      <div className="pagespeed-content">
        <div className="scores-grid">
          <ScoreCircle score={data.scores.performance} label="Performance" />
          <ScoreCircle score={data.scores.accessibility} label="Accessibility" />
          <ScoreCircle score={data.scores.best_practices} label="Best Practices" />
          <ScoreCircle score={data.scores.seo} label="SEO" />
        </div>

        <div className="metrics-section">
          <h3>⚡ Core Web Vitals</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">🎨</div>
              <div className="metric-info">
                <div className="metric-label">First Contentful Paint</div>
                <div className="metric-value">{formatMetric(data.metrics.first_contentful_paint)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-info">
                <div className="metric-label">Speed Index</div>
                <div className="metric-value">{formatMetric(data.metrics.speed_index)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🖼️</div>
              <div className="metric-info">
                <div className="metric-label">Largest Contentful Paint</div>
                <div className="metric-value">{formatMetric(data.metrics.largest_contentful_paint)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-info">
                <div className="metric-label">Time to Interactive</div>
                <div className="metric-value">{formatMetric(data.metrics.time_to_interactive)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-info">
                <div className="metric-label">Total Blocking Time</div>
                <div className="metric-value">{formatMetric(data.metrics.total_blocking_time)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📐</div>
              <div className="metric-info">
                <div className="metric-label">Cumulative Layout Shift</div>
                <div className="metric-value">
                  {data.metrics.cumulative_layout_shift 
                    ? data.metrics.cumulative_layout_shift.toFixed(3) 
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {data.opportunities && data.opportunities.length > 0 && (
          <div className="opportunities-section">
            <h3>💡 Opportunities for Improvement</h3>
            <div className="opportunities-list">
              {data.opportunities.map((opp, index) => (
                <div key={index} className="opportunity-item">
                  <div className="opportunity-title">{opp.title}</div>
                  <div className="opportunity-description">{opp.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5.63604 5.63604L7.05025 7.05025" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.9497 16.9497L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="brand">
                <h1>SiteScope</h1>
                <p>Professional Website Analysis & Performance Insights</p>
              </div>
            </div>

            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name || user.email.split('@')[0]
                  }
                </span>
                <svg className={`dropdown-icon ${showUserMenu ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email.split('@')[0]
                        }
                      </div>
                      <div className="dropdown-user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      setScrapedData(null);
                      setUrl('');
                    }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., example.com)"
              className="url-input"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Analyze Website
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Analyzing website performance and content...</p>
            <p className="loading-subtext">This may take 10-30 seconds</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <div className="error-icon">⚠️</div>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {scrapedData && (
          <div className="results">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`tab ${activeTab === 'ai-optimizer' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-optimizer')}
              >
                🤖 AI Optimizer
              </button>
              <button 
                className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                ⚡ Performance
              </button>
              <button 
                className={`tab ${activeTab === 'seo' ? 'active' : ''}`}
                onClick={() => setActiveTab('seo')}
              >
                🎯 SEO & Meta
              </button>
              <button 
                className={`tab ${activeTab === 'links' ? 'active' : ''}`}
                onClick={() => setActiveTab('links')}
              >
                🔗 Links
              </button>
              <button 
                className={`tab ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                📄 Content
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'ai-optimizer' && (
                <AIOptimizer scrapedData={scrapedData} />
              )}

              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">🌐</div>
                      <div className="stat-content">
                        <div className="stat-label">URL</div>
                        <div className="stat-value">
                          <a href={scrapedData.url} target="_blank" rel="noopener noreferrer">
                            {scrapedData.url}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-content">
                        <div className="stat-label">Status</div>
                        <div className="stat-value">
                          <span className="status-badge">{scrapedData.status_code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📦</div>
                      <div className="stat-content">
                        <div className="stat-label">Size</div>
                        <div className="stat-value">{(scrapedData.content_length / 1024).toFixed(2)} KB</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🌍</div>
                      <div className="stat-content">
                        <div className="stat-label">Language</div>
                        <div className="stat-value">{scrapedData.language}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🔗</div>
                      <div className="stat-content">
                        <div className="stat-label">Internal Links</div>
                        <div className="stat-value">{scrapedData.internal_links_count}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🌐</div>
                      <div className="stat-content">
                        <div className="stat-label">External Links</div>
                        <div className="stat-value">{scrapedData.external_links_count}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🖼️</div>
                      <div className="stat-content">
                        <div className="stat-label">Images</div>
                        <div className="stat-value">{scrapedData.images_count}</div>
                      </div>
                    </div>
                    {scrapedData.canonical_url && (
                      <div className="stat-card">
                        <div className="stat-icon">📌</div>
                        <div className="stat-content">
                          <div className="stat-label">Canonical URL</div>
                          <div className="stat-value">
                            <a href={scrapedData.canonical_url} target="_blank" rel="noopener noreferrer">
                              Set
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="quick-meta">
                    <h2>📝 Quick Meta Info</h2>
                    <div className="meta-preview">
                      <div className="meta-title">{scrapedData.meta_title}</div>
                      <div className="meta-description">{scrapedData.meta_description}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="performance-tab">
                  {scrapedData.pagespeed_insights?.error ? (
                    <div className="info-banner">
                      <div className="info-icon">ℹ️</div>
                      <div>
                        <strong>PageSpeed Insights Unavailable</strong>
                        <p>{scrapedData.pagespeed_insights.error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="strategy-tabs">
                        <div className="strategy-section">
                          <h2>💻 Desktop Performance</h2>
                          <PageSpeedSection 
                            data={scrapedData.pagespeed_insights?.desktop} 
                            strategy="desktop" 
                          />
                        </div>
                        
                        <div className="strategy-section">
                          <h2>📱 Mobile Performance</h2>
                          <PageSpeedSection 
                            data={scrapedData.pagespeed_insights?.mobile} 
                            strategy="mobile" 
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="seo-tab">
                  <div className="seo-section">
                    <h2>📝 Meta Information</h2>
                    <div className="seo-grid">
                      <div className="seo-card">
                        <strong>Title</strong>
                        <p>{scrapedData.meta_title}</p>
                        <small>{scrapedData.meta_title.length} characters</small>
                      </div>
                      <div className="seo-card">
                        <strong>Description</strong>
                        <p>{scrapedData.meta_description}</p>
                        <small>{scrapedData.meta_description.length} characters</small>
                      </div>
                      <div className="seo-card">
                        <strong>Keywords</strong>
                        <p>{scrapedData.meta_keywords}</p>
                      </div>
                    </div>
                  </div>

                  {scrapedData.og_image && (
                    <div className="seo-section">
                      <h2>🖼️ Open Graph Image</h2>
                      <div className="og-image-preview">
                        <img src={scrapedData.og_image} alt="Open Graph" />
                      </div>
                    </div>
                  )}

                  {Object.keys(scrapedData.headings).length > 0 && (
                    <div className="seo-section">
                      <h2>📑 Heading Structure</h2>
                      <div className="headings-container">
                        {Object.entries(scrapedData.headings).map(([tag, headings]) => (
                          <div key={tag} className="heading-group">
                            <strong className="heading-tag">{tag.toUpperCase()}</strong>
                            <span className="heading-count">({headings.length})</span>
                            <ul>
                              {headings.slice(0, 10).map((heading, index) => (
                                <li key={index}>{heading}</li>
                              ))}
                              {headings.length > 10 && (
                                <li className="more-items">...and {headings.length - 10} more</li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="links-tab">
                  <div className="links-section">
                    <h2>🔗 Internal Links ({scrapedData.internal_links_count})</h2>
                    {scrapedData.internal_links.length > 0 ? (
                      <div className="links-list">
                        {scrapedData.internal_links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-card internal"
                          >
                            <span className="link-icon">🔗</span>
                            <span className="link-url">{link}</span>
                            <span className="link-arrow">→</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No internal links found</p>
                    )}
                  </div>

                  <div className="links-section">
                    <h2>🌐 External Links ({scrapedData.external_links_count})</h2>
                    {scrapedData.external_links.length > 0 ? (
                      <div className="links-list">
                        {scrapedData.external_links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
          target="_blank"
          rel="noopener noreferrer"
                            className="link-card external"
                          >
                            <span className="link-icon">🌐</span>
                            <span className="link-url">{link}</span>
                            <span className="link-arrow">↗</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No external links found</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="content-tab">
                  <div className="content-section">
                    <h2>📄 Content Preview</h2>
                    <div className="content-box">
                      {scrapedData.content}
                    </div>
                  </div>

                  {scrapedData.images.length > 0 && (
                    <div className="content-section">
                      <h2>🖼️ Images ({scrapedData.images_count})</h2>
                      <div className="images-grid">
                        {scrapedData.images.map((image, index) => (
                          <div key={index} className="image-card">
                            <div className="image-wrapper">
                              <img src={image.src} alt={image.alt} loading="lazy" />
                            </div>
                            <div className="image-info">
                              <p className="image-alt">{image.alt || 'No alt text'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Chatbot - appears when there's scraped data */}
        {scrapedData && <AIChatbot scrapedData={scrapedData} />}
      </div>
    </div>
  );
}

export default App;
