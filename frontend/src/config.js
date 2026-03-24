// frontend/src/config.js
// Configuration centralisée pour l'API

const normalizeApiBaseUrl = (url) => {
  const baseUrl = (url || 'http://localhost:8000').replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
const API_KEY = process.env.REACT_APP_SERVER_API_KEY || '';
const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

console.log('🔗 API_BASE_URL configured:', API_BASE_URL);

export { API_BASE_URL, API_KEY, buildApiUrl };
