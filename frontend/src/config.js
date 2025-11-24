// API Configuration
// Use environment variable if available, fallback to proxy in development
export const API_URL = process.env.REACT_APP_API_URL || '';

// For development with proxy: use empty string (proxy handles it)
// For production: use full backend URL from environment variable

export default API_URL;

