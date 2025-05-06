import axios from 'axios';

// Backend URL - explicitly set to match Docker backend service
const BACKEND_URL = 'http://localhost:8000';

// Create an Axios instance with explicit baseURL
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Important for cookies/CSRF
  withCredentials: true
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log outgoing requests for debugging
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('🔴 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ API Response [${response.status}]:`, response.data);
    return response;
  },
  (error) => {
    // Log errors for debugging
    console.error('🔴 API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Utility function for making API calls with better error handling
export const callApi = async (method, endpoint, data = null, options = {}) => {
  try {
    // Ensure endpoint starts with /api/ and doesn't duplicate the base URL
    const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const config = {
      method,
      url: apiEndpoint,
      ...options
    };
    
    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    console.log(`Calling API: ${method.toUpperCase()} ${BACKEND_URL}${apiEndpoint}`);
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`API Call Failed: ${method.toUpperCase()} ${endpoint}`, error);
    throw error;
  }
};

// Function to test backend connectivity
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection to:', BACKEND_URL);
    // Try a direct request without using the proxy
    const response = await axios.get(`${BACKEND_URL}/api/health-check/`, { 
      timeout: 5000,
      withCredentials: true 
    });
    console.log('Backend connection successful:', response.data);
    return {
      success: true,
      data: response.data,
      url: BACKEND_URL
    };
  } catch (error) {
    console.error('Backend connection failed:', error);
    // Try alternative endpoint in case health-check is not implemented
    try {
      console.log('Trying alternative endpoint...');
      const response = await axios.get(`${BACKEND_URL}/admin/login/`, { 
        timeout: 5000,
        withCredentials: true 
      });
      console.log('Backend connection successful (alternative):', response.status);
      return {
        success: true,
        data: { status: 'Admin login page reachable' },
        url: BACKEND_URL
      };
    } catch (secondError) {
      console.error('All backend connection attempts failed');
      return {
        success: false,
        error: error.message,
        secondError: secondError.message,
        isNetworkError: !error.response,
        status: error.response?.status,
        url: BACKEND_URL
      };
    }
  }
};

export default api; 