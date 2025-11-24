import React, { useState } from 'react';
import './AIOptimizer.css';

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

function AIOptimizer({ scrapedData }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [titleSuggestions, setTitleSuggestions] = useState(null);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState(null);
  const [keywordSuggestions, setKeywordSuggestions] = useState(null);
  const [headingSuggestions, setHeadingSuggestions] = useState(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [contentImprovements, setContentImprovements] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const generateTitleSuggestions = async () => {
    setAiLoading(true);
    setActiveSection('title');
    try {
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/optimize-title/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          current_title: scrapedData.meta_title,
          meta_description: scrapedData.meta_description,
          content_preview: scrapedData.content,
          keywords: scrapedData.meta_keywords
        }),
      });
      const result = await response.json();
      if (result.success) {
        setTitleSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateDescriptionSuggestions = async () => {
    setAiLoading(true);
    setActiveSection('description');
    try {
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/optimize-description/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          current_description: scrapedData.meta_description,
          meta_title: scrapedData.meta_title,
          content_preview: scrapedData.content,
          keywords: scrapedData.meta_keywords
        }),
      });
      const result = await response.json();
      if (result.success) {
        setDescriptionSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateKeywords = async () => {
    setAiLoading(true);
    setActiveSection('keywords');
    try {
      const headingsArray = Object.values(scrapedData.headings || {}).flat();
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/generate-keywords/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          meta_title: scrapedData.meta_title,
          meta_description: scrapedData.meta_description,
          content_preview: scrapedData.content,
          headings: headingsArray
        }),
      });
      const result = await response.json();
      if (result.success) {
        setKeywordSuggestions(result.keywords);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateHeadingSuggestions = async () => {
    setAiLoading(true);
    setActiveSection('headings');
    try {
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/heading-suggestions/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          current_headings: scrapedData.headings,
          meta_title: scrapedData.meta_title,
          content_preview: scrapedData.content
        }),
      });
      const result = await response.json();
      if (result.success) {
        setHeadingSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateComprehensiveAnalysis = async () => {
    setAiLoading(true);
    setActiveSection('analysis');
    try {
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/comprehensive-analysis/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          scraped_data: scrapedData
        }),
      });
      const result = await response.json();
      if (result.success) {
        setComprehensiveAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateContentImprovements = async () => {
    setAiLoading(true);
    setActiveSection('content');
    try {
      const headingsArray = Object.values(scrapedData.headings || {}).flat();
      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/content-improvements/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          content_preview: scrapedData.content,
          meta_title: scrapedData.meta_title,
          headings: headingsArray,
          target_keywords: scrapedData.meta_keywords
        }),
      });
      const result = await response.json();
      if (result.success) {
        setContentImprovements(result.improvements);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="ai-optimizer-new">
      <div className="ai-hero">
        <div className="ai-hero-content">
          <h2>🤖 AI-Powered SEO Optimizer</h2>
          <p>Generate professional SEO content suggestions using advanced AI</p>
        </div>
      </div>

      <div className="ai-action-grid">
        <button onClick={generateComprehensiveAnalysis} disabled={aiLoading} className="action-card analysis">
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h3>SEO Analysis</h3>
            <p>Complete audit with score</p>
          </div>
        </button>
        
        <button onClick={generateTitleSuggestions} disabled={aiLoading} className="action-card title">
          <div className="action-icon">📝</div>
          <div className="action-content">
            <h3>Optimize Title</h3>
            <p>5 AI-generated titles</p>
          </div>
        </button>
        
        <button onClick={generateDescriptionSuggestions} disabled={aiLoading} className="action-card description">
          <div className="action-icon">📄</div>
          <div className="action-content">
            <h3>Optimize Description</h3>
            <p>5 compelling descriptions</p>
          </div>
        </button>
        
        <button onClick={generateKeywords} disabled={aiLoading} className="action-card keywords">
          <div className="action-icon">🎯</div>
          <div className="action-content">
            <h3>Keywords Strategy</h3>
            <p>Primary, LSI & long-tail</p>
          </div>
        </button>
        
        <button onClick={generateHeadingSuggestions} disabled={aiLoading} className="action-card headings">
          <div className="action-icon">📑</div>
          <div className="action-content">
            <h3>Heading Structure</h3>
            <p>H1, H2, H3 suggestions</p>
          </div>
        </button>
        
        <button onClick={generateContentImprovements} disabled={aiLoading} className="action-card content">
          <div className="action-icon">✨</div>
          <div className="action-content">
            <h3>Content Tips</h3>
            <p>Improvement recommendations</p>
          </div>
        </button>
      </div>

      {aiLoading && (
        <div className="ai-loading-overlay">
          <div className="ai-loading-content">
            <div className="ai-spinner-large"></div>
            <p>AI is analyzing and generating suggestions...</p>
            <small>This usually takes 5-15 seconds</small>
          </div>
        </div>
      )}

      {/* Comprehensive Analysis */}
      {comprehensiveAnalysis && activeSection === 'analysis' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>📊 Current SEO Status</h3>
            <div className="original-content">
              <div className="stat-item">
                <strong>Meta Title:</strong>
                <p>{scrapedData.meta_title}</p>
              </div>
              <div className="stat-item">
                <strong>Meta Description:</strong>
                <p>{scrapedData.meta_description}</p>
              </div>
              <div className="stat-item">
                <strong>Internal Links:</strong>
                <p>{scrapedData.internal_links_count}</p>
              </div>
              <div className="stat-item">
                <strong>External Links:</strong>
                <p>{scrapedData.external_links_count}</p>
              </div>
              <div className="stat-item">
                <strong>Images:</strong>
                <p>{scrapedData.images_count}</p>
              </div>
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 AI Analysis Results</h3>
            <div className="seo-score-card">
              <div className="score-display" style={{ color: getScoreColor(comprehensiveAnalysis.score) }}>
                <div className="score-number">{comprehensiveAnalysis.score}</div>
                <div className="score-label">SEO Score</div>
              </div>
            </div>

            <div className="analysis-sections">
              <div className="analysis-section critical">
                <div className="section-header">
                  <h4>🚨 Critical Issues</h4>
                  <button onClick={() => copyToClipboard(comprehensiveAnalysis.critical_issues.join('\n'), 'critical')} className="copy-btn-icon">
                    {copiedText === 'critical' ? '✓' : '📋'}
                  </button>
                </div>
                <ul>
                  {comprehensiveAnalysis.critical_issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section quick-wins">
                <div className="section-header">
                  <h4>🎯 Quick Wins</h4>
                  <button onClick={() => copyToClipboard(comprehensiveAnalysis.quick_wins.join('\n'), 'wins')} className="copy-btn-icon">
                    {copiedText === 'wins' ? '✓' : '📋'}
                  </button>
                </div>
                <ul>
                  {comprehensiveAnalysis.quick_wins.map((win, i) => (
                    <li key={i}>{win}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section strategy">
                <div className="section-header">
                  <h4>📈 Long-term Strategy</h4>
                  <button onClick={() => copyToClipboard(comprehensiveAnalysis.strategy.join('\n'), 'strategy')} className="copy-btn-icon">
                    {copiedText === 'strategy' ? '✓' : '📋'}
                  </button>
                </div>
                <ul>
                  {comprehensiveAnalysis.strategy.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section technical">
                <div className="section-header">
                  <h4>⚙️ Technical SEO</h4>
                  <button onClick={() => copyToClipboard(comprehensiveAnalysis.technical.join('\n'), 'technical')} className="copy-btn-icon">
                    {copiedText === 'technical' ? '✓' : '📋'}
                  </button>
                </div>
                <ul>
                  {comprehensiveAnalysis.technical.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="content-quality-section">
                <div className="section-header">
                  <h4>📝 Content Quality Assessment</h4>
                  <button onClick={() => copyToClipboard(comprehensiveAnalysis.content_quality, 'quality')} className="copy-btn-icon">
                    {copiedText === 'quality' ? '✓' : '📋'}
                  </button>
                </div>
                <p>{comprehensiveAnalysis.content_quality}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Suggestions */}
      {titleSuggestions && activeSection === 'title' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>📝 Current Title</h3>
            <div className="original-box">
              <div className="original-text">{scrapedData.meta_title}</div>
              <div className="original-stats">
                <span>Length: {scrapedData.meta_title.length} characters</span>
                <span className={scrapedData.meta_title.length >= 50 && scrapedData.meta_title.length <= 60 ? 'optimal' : 'warning'}>
                  {scrapedData.meta_title.length >= 50 && scrapedData.meta_title.length <= 60 ? '✓ Optimal' : '⚠ Not optimal'}
                </span>
              </div>
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 AI-Generated Titles</h3>
            <div className="suggestions-wrapper">
              {titleSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-badge">#{index + 1}</div>
                  <div className="suggestion-text">{suggestion.title}</div>
                  <div className="suggestion-meta">
                    <span className="char-count">{suggestion.length} chars</span>
                    <span className="reason">{suggestion.reason}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(suggestion.title, `title-${index}`)}
                    className="copy-btn-suggestion"
                  >
                    {copiedText === `title-${index}` ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description Suggestions */}
      {descriptionSuggestions && activeSection === 'description' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>📄 Current Description</h3>
            <div className="original-box">
              <div className="original-text">{scrapedData.meta_description}</div>
              <div className="original-stats">
                <span>Length: {scrapedData.meta_description.length} characters</span>
                <span className={scrapedData.meta_description.length >= 150 && scrapedData.meta_description.length <= 160 ? 'optimal' : 'warning'}>
                  {scrapedData.meta_description.length >= 150 && scrapedData.meta_description.length <= 160 ? '✓ Optimal' : '⚠ Not optimal'}
                </span>
              </div>
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 AI-Generated Descriptions</h3>
            <div className="suggestions-wrapper">
              {descriptionSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-badge">#{index + 1}</div>
                  <div className="suggestion-text">{suggestion.description}</div>
                  <div className="suggestion-meta">
                    <span className="char-count">{suggestion.length} chars</span>
                    <span className="reason">{suggestion.reason}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(suggestion.description, `desc-${index}`)}
                    className="copy-btn-suggestion"
                  >
                    {copiedText === `desc-${index}` ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywordSuggestions && activeSection === 'keywords' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>🎯 Current Keywords</h3>
            <div className="original-box">
              <div className="original-text">{scrapedData.meta_keywords || 'No keywords found'}</div>
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 AI Keyword Strategy</h3>
            <div className="keywords-sections">
              <div className="keyword-section primary">
                <div className="section-header">
                  <h4>Primary Keywords</h4>
                  <button onClick={() => copyToClipboard(keywordSuggestions.primary.join(', '), 'primary')} className="copy-btn-icon">
                    {copiedText === 'primary' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="keyword-pills">
                  {keywordSuggestions.primary.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="keyword-section secondary">
                <div className="section-header">
                  <h4>Secondary Keywords</h4>
                  <button onClick={() => copyToClipboard(keywordSuggestions.secondary.join(', '), 'secondary')} className="copy-btn-icon">
                    {copiedText === 'secondary' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="keyword-pills">
                  {keywordSuggestions.secondary.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="keyword-section longtail">
                <div className="section-header">
                  <h4>Long-tail Keywords</h4>
                  <button onClick={() => copyToClipboard(keywordSuggestions.long_tail.join(', '), 'longtail')} className="copy-btn-icon">
                    {copiedText === 'longtail' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="keyword-pills">
                  {keywordSuggestions.long_tail.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="keyword-section lsi">
                <div className="section-header">
                  <h4>LSI Keywords</h4>
                  <button onClick={() => copyToClipboard(keywordSuggestions.lsi.join(', '), 'lsi')} className="copy-btn-icon">
                    {copiedText === 'lsi' ? '✓' : '📋'}
                  </button>
                </div>
                <div className="keyword-pills">
                  {keywordSuggestions.lsi.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heading Suggestions */}
      {headingSuggestions && activeSection === 'headings' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>📑 Current Headings</h3>
            <div className="original-content">
              {Object.entries(scrapedData.headings || {}).map(([tag, headings]) => (
                <div key={tag} className="heading-group-original">
                  <strong>{tag.toUpperCase()}:</strong>
                  <ul>
                    {headings.slice(0, 3).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                    {headings.length > 3 && <li className="more">...and {headings.length - 3} more</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 AI Heading Suggestions</h3>
            <div className="heading-suggestions-wrapper">
              <div className="heading-section">
                <div className="section-header">
                  <h4>H1 Suggestions</h4>
                  <button onClick={() => copyToClipboard(headingSuggestions.h1.join('\n'), 'h1')} className="copy-btn-icon">
                    {copiedText === 'h1' ? '✓' : '📋'}
                  </button>
                </div>
                {headingSuggestions.h1.map((h, i) => (
                  <div key={i} className="heading-item">
                    <span>{h}</span>
                    <button onClick={() => copyToClipboard(h, `h1-${i}`)} className="copy-btn-small">
                      {copiedText === `h1-${i}` ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="heading-section">
                <div className="section-header">
                  <h4>H2 Suggestions</h4>
                  <button onClick={() => copyToClipboard(headingSuggestions.h2.join('\n'), 'h2')} className="copy-btn-icon">
                    {copiedText === 'h2' ? '✓' : '📋'}
                  </button>
                </div>
                {headingSuggestions.h2.map((h, i) => (
                  <div key={i} className="heading-item">
                    <span>{h}</span>
                    <button onClick={() => copyToClipboard(h, `h2-${i}`)} className="copy-btn-small">
                      {copiedText === `h2-${i}` ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="heading-section">
                <div className="section-header">
                  <h4>H3 Suggestions</h4>
                  <button onClick={() => copyToClipboard(headingSuggestions.h3.join('\n'), 'h3')} className="copy-btn-icon">
                    {copiedText === 'h3' ? '✓' : '📋'}
                  </button>
                </div>
                {headingSuggestions.h3.map((h, i) => (
                  <div key={i} className="heading-item">
                    <span>{h}</span>
                    <button onClick={() => copyToClipboard(h, `h3-${i}`)} className="copy-btn-small">
                      {copiedText === `h3-${i}` ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="recommendations-section">
                <div className="section-header">
                  <h4>📋 Structure Recommendations</h4>
                  <button onClick={() => copyToClipboard(headingSuggestions.recommendations.join('\n'), 'rec')} className="copy-btn-icon">
                    {copiedText === 'rec' ? '✓' : '📋'}
                  </button>
                </div>
                <ul>
                  {headingSuggestions.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Improvements */}
      {contentImprovements && activeSection === 'content' && (
        <div className="split-view-container">
          <div className="split-left">
            <h3>✨ Current Content</h3>
            <div className="original-box content-preview">
              {scrapedData.content.substring(0, 500)}...
            </div>
          </div>

          <div className="split-right">
            <h3>🤖 Content Improvement Tips</h3>
            <div className="improvements-wrapper">
              {Object.entries(contentImprovements).map(([category, items]) => (
                <div key={category} className="improvement-section">
                  <div className="section-header">
                    <h4>
                      {category === 'structure' && '📐 Structure'}
                      {category === 'keywords' && '🎯 Keywords'}
                      {category === 'readability' && '📖 Readability'}
                      {category === 'seo' && '🔍 SEO'}
                      {category === 'cta' && '📢 Call-to-Action'}
                    </h4>
                    <button onClick={() => copyToClipboard(items.join('\n'), category)} className="copy-btn-icon">
                      {copiedText === category ? '✓' : '📋'}
                    </button>
                  </div>
                  <ul>
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIOptimizer;
