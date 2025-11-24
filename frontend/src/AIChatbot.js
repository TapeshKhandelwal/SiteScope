import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './AIChatbot.css';

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

function AIChatbot({ scrapedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 **Hi there!** I\'m **SiteSense**, your intelligent SEO companion.\n\nI can help you understand and improve this website. Ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const userHasAskedQuestion = messages.some(msg => msg.role === 'user');

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build chat history for context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const csrfToken = getCookie('csrftoken');
      const response = await fetch('/api/ai/chat/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({
          question: inputMessage,
          scraped_data: scrapedData,
          chat_history: chatHistory
        }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage = {
          role: 'assistant',
          content: result.answer,
          optimized_question: result.optimized_question,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: '❌ **Error:** I encountered an issue. Please try again or rephrase your question.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ **Connection Error:** Unable to reach the AI service. Please ensure the backend is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the main SEO issues?",
    "How can I improve the meta description?",
    "What keywords should I focus on?",
    "How is the internal linking?",
    "Any technical SEO problems?",
    "What's the content quality?"
  ];

  const askSuggestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '✨ **Chat cleared!** SiteSense is ready to help. What would you like to know about this website?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="SiteSense AI Assistant"
      >
        {isOpen ? '✕' : '🧠'}
        {!isOpen && <span className="chat-badge">AI</span>}
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar-header">
              <div className="avatar-glow">🤖</div>
            </div>
            <div className="chat-header-text">
              <h3>SiteSense AI</h3>
              <p className="status-indicator">
                <span className="status-dot"></span>
                Online & Ready
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            <button onClick={clearChat} className="header-btn" title="Clear chat">
              <span>🗑️</span>
            </button>
            <button onClick={() => setIsOpen(false)} className="header-btn close">
              <span>✕</span>
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <span>🤖</span>
                </div>
              )}
              <div className="message-bubble">
                {message.optimized_question && message.role === 'assistant' && (
                  <div className="optimized-badge">
                    <span className="badge-icon">✨</span>
                    <span className="badge-text">Optimized: {message.optimized_question}</span>
                  </div>
                )}
                <div className="message-text">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p style={{margin: '0.5em 0'}} {...props} />,
                      ul: ({node, ...props}) => <ul style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                      ol: ({node, ...props}) => <ol style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                      li: ({node, ...props}) => <li style={{margin: '0.3em 0'}} {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? 
                          <code style={{
                            background: 'rgba(0,0,0,0.1)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em'
                          }} {...props} /> :
                          <code {...props} />,
                      strong: ({node, ...props}) => <strong style={{fontWeight: '700', color: 'inherit'}} {...props} />
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="message-avatar user">
                  <span>👤</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <span>🤖</span>
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="typing-text">AI is thinking...</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Only show if user hasn't asked anything yet */}
        {!userHasAskedQuestion && (
          <div className="suggested-questions">
            <p className="suggested-title">
              <span className="title-icon">💡</span>
              Try asking:
            </p>
            <div className="suggestions-grid">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => askSuggestion(question)}
                  className="suggestion-chip"
                  disabled={isLoading}
                >
                  <span className="chip-icon">✨</span>
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this website..."
              className="chat-input"
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
              title="Send message"
            >
              {isLoading ? (
                <span className="btn-loading">⏳</span>
              ) : (
                <span className="btn-send">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </span>
              )}
            </button>
          </div>
          <div className="chat-footer">
            <span className="footer-text">
              <strong>SiteSense</strong> powered by Gemini AI • Press <kbd>Enter</kbd> to send
            </span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="chat-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default AIChatbot;
