import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { callApi, testBackendConnection } from '../services/api';
import axios from 'axios';

/**
 * RegisterPage Component
 * 
 * Provides user registration for the DPP application
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    position: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugHelp, setDebugHelp] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false, url: '' });
  const [manualCheck, setManualCheck] = useState({ attempted: false, result: null });
  const [advancedDebug, setAdvancedDebug] = useState(false);
  const [testUrl, setTestUrl] = useState('http://localhost:8000/api/auth/register/');
  const [testUrlResult, setTestUrlResult] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'gray'
  });

  // Test backend connection when component mounts
  useEffect(() => {
    const checkBackendConnection = async () => {
      console.log('Checking backend connection...');
      const result = await testBackendConnection();
      setBackendStatus({ 
        checked: true, 
        online: result.success,
        error: result.error,
        url: result.url
      });
      
      if (!result.success) {
        console.warn('Backend connection check failed:', result.error);
      }
    };
    
    checkBackendConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Check password strength if password field is changed
    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };

  // Function to check password strength
  const checkPasswordStrength = (password) => {
    // Initialize score
    let score = 0;
    let message = '';
    let color = 'gray';

    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: 'gray' });
      return;
    }

    // Check length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Check for lowercase and uppercase letters
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Check for numbers
    if (/\d/.test(password)) score += 1;

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message and color based on score
    if (score === 0) {
      message = 'Very weak';
      color = 'red';
    } else if (score === 1) {
      message = 'Weak';
      color = 'red';
    } else if (score === 2) {
      message = 'Fair';
      color = 'orange';
    } else if (score === 3) {
      message = 'Good';
      color = 'yellow';
    } else if (score === 4) {
      message = 'Strong';
      color = 'green';
    } else if (score === 5) {
      message = 'Very strong';
      color = 'green';
    }

    setPasswordStrength({ score, message, color });
  };

  const toggleDebugHelp = () => {
    setDebugHelp(!debugHelp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowDebugInfo(false);

    // Simple validation
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Create a copy of the form data to clean up before sending
    const cleanedFormData = { ...formData };
    
    // Remove any leading/trailing whitespace
    Object.keys(cleanedFormData).forEach(key => {
      if (typeof cleanedFormData[key] === 'string') {
        cleanedFormData[key] = cleanedFormData[key].trim();
      }
    });
    
    // If empty optional fields, convert to null to avoid backend validation issues
    if (!cleanedFormData.position) cleanedFormData.position = null;
    if (!cleanedFormData.phone) cleanedFormData.phone = null;
    
    // Remove password2 as it's not needed for the API call
    const { password2, ...dataToSend } = cleanedFormData;
    
    // Log what we're sending (for debugging)
    console.log('Sending registration data:', JSON.stringify(dataToSend, null, 2));

    try {
      // Add network status check
      const isOnline = navigator.onLine;
      if (!isOnline) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      console.log('Attempting to reach backend server...');
      
      // Try the normal API call first
      let response;
      try {
        // Use the callApi utility function to make the API call using our configured service
        response = await callApi('post', '/auth/register/', dataToSend);
      } catch (apiError) {
        console.error('First API attempt failed:', apiError);
        
        // If that fails, try a direct axios call as fallback
        console.log('Trying fallback direct API call...');
        const BACKEND_URL = backendStatus.url || 'http://localhost:8000';
        
        response = await axios.post(`${BACKEND_URL}/api/auth/register/`, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        });
        
        // If we got here, the direct call worked
        console.log('Direct API call succeeded:', response);
      }
      
      console.log('Registration success response:', response);
      setSuccess(true);
      
      // Clear form data
      setFormData({
        email: '',
        username: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        position: '',
        phone: ''
      });
    } catch (err) {
      console.error('Registration error:', err);
      setShowDebugInfo(true);
      
      // Log the full error for debugging
      console.error('Full error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        isOnline: navigator.onLine
      });
      
      // Add network error specific handling
      if (!navigator.onLine) {
        setError('Network error: You are currently offline. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
      // Add CORS error detection
      if (err.message && (
        err.message.includes('Network Error') || 
        err.message.includes('CORS') ||
        err.message.includes('proxy')
      )) {
        setError(`Network/CORS error: Cannot connect to the backend server. 
        
The server might be down or there might be a CORS issue. 

Technical details:
- Check if backend is running at ${backendStatus.url}
- Verify that your browser isn't blocking requests
- Check that CORS is properly configured on the backend
- Check browser console (F12) for more details`);
        setLoading(false);
        return;
      }
      
      // Handle different error scenarios
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = err.response.data;
        
        if (typeof errorData === 'object') {
          const errorMessages = [];
          
          Object.keys(errorData).forEach(field => {
            const fieldErrors = errorData[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${fieldErrors.join(', ')}`);
            } else if (typeof fieldErrors === 'string') {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${fieldErrors}`);
            } else if (typeof fieldErrors === 'object') {
              Object.keys(fieldErrors).forEach(subField => {
                const subErrors = fieldErrors[subField];
                errorMessages.push(`${field}.${subField}: ${Array.isArray(subErrors) ? subErrors.join(', ') : subErrors}`);
              });
            }
          });
          
          if (errorMessages.length > 0) {
            setError(`Registration failed: \n${errorMessages.join('\n')}`);
          } else {
            setError('Registration failed with status code ' + err.response.status);
          }
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError(err.response.statusText || 'Registration failed');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    try {
      setManualCheck({ attempted: true, result: 'checking' });
      const BACKEND_URL = backendStatus.url || 'http://localhost:8000';
      
      // Try to fetch the admin login page
      const response = await fetch(`${BACKEND_URL}/admin/login/`, {
        mode: 'no-cors' // This allows us to at least check if the server is reachable
      });
      
      setManualCheck({ 
        attempted: true, 
        result: 'success',
        details: 'The backend server appears to be reachable. The issue may be with CORS or API configuration.'
      });
    } catch (error) {
      setManualCheck({ 
        attempted: true, 
        result: 'error',
        details: `Error reaching backend: ${error.message}`
      });
    }
  };

  const handleTestUrl = async () => {
    if (!testUrl) return;
    
    setTestUrlResult({ status: 'checking' });
    
    try {
      // Make a simple OPTIONS request to check if the endpoint is accessible
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setTestUrlResult({
        status: 'success',
        statusCode: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'content-type': response.headers.get('content-type')
        }
      });
    } catch (error) {
      setTestUrlResult({
        status: 'error',
        message: error.message
      });
    }
  };

  const toggleAdvancedDebug = () => {
    setAdvancedDebug(!advancedDebug);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-blue-600">Register</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an account to manage your Digital Product Passports
          </p>
          
          {/* Backend connection status */}
          {backendStatus.checked && (
            <div className={`mt-2 text-center text-xs px-2 py-1 rounded-full inline-block ${
              backendStatus.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              Backend: {backendStatus.online ? '✅ Connected' : '❌ Disconnected'}
              {!backendStatus.online && (
                <span className="block text-xs mt-1">
                  Error: {backendStatus.error || 'Unknown error'}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Backend connection issue box */}
        {backendStatus.checked && !backendStatus.online && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
            <h3 className="text-orange-800 font-medium mb-2">Backend Connection Issue Detected</h3>
            <p className="text-sm text-orange-700 mb-2">
              We're having trouble connecting to the backend server. This could be due to one of the following reasons:
            </p>
            <ul className="text-sm text-orange-700 list-disc pl-5 space-y-1">
              <li>The backend service is not running</li>
              <li>There's a network connectivity issue</li>
              <li>CORS settings are preventing the connection</li>
              <li>A firewall is blocking the connection</li>
            </ul>
            <div className="mt-3">
              <p className="text-sm text-orange-800 font-medium">Try these solutions:</p>
              <ol className="text-sm text-orange-700 list-decimal pl-5 space-y-1 mt-1">
                <li>Check if Docker is running and the backend container is up</li>
                <li>Make sure you can access <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:8000/admin/</a> in your browser</li>
                <li>Try restarting the backend service with <code className="bg-orange-100 px-1">docker-compose restart backend</code></li>
                <li>Check if there are any error messages in the backend logs</li>
              </ol>
            </div>
            
            {/* Manual check button */}
            <div className="mt-3 flex flex-col items-center">
              <button
                onClick={handleManualCheck}
                disabled={manualCheck.result === 'checking'}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {manualCheck.result === 'checking' ? 'Checking...' : 'Check Backend Connection Manually'}
              </button>
              
              {manualCheck.attempted && manualCheck.result !== 'checking' && (
                <div className={`mt-2 text-sm ${manualCheck.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {manualCheck.details}
                </div>
              )}
              
              {manualCheck.result === 'success' && (
                <div className="mt-3 text-sm text-orange-700 bg-orange-100 p-2 rounded">
                  <p className="font-medium">Since the server is reachable but the API isn't working, this is likely a CORS issue.</p>
                  <p className="mt-1">Try editing your backend's CORS settings to allow requests from your frontend origin (http://localhost:3000).</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Registration Requirements Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <h3 className="text-blue-800 font-medium mb-2">Registration Requirements:</h3>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>All fields marked with * are required</li>
            <li>Email must be valid and unique</li>
            <li>Username must be unique (letters, digits and @/./+/-/_)</li>
            <li><strong>Password requirements:</strong></li>
            <ul className="list-disc pl-5 space-y-1">
              <li>Minimum 8 characters</li>
              <li>Cannot be too similar to your other information</li>
              <li>Cannot be a commonly used password</li>
              <li>Cannot be entirely numeric</li>
              <li>Should include uppercase, lowercase, numbers and special characters</li>
            </ul>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <p className="text-red-700 whitespace-pre-line">{error}</p>
            {showDebugInfo && (
              <div>
                <p className="text-xs mt-2 text-red-500">
                  For developers: Check the browser console (F12) for more detailed error information.
                  <button 
                    onClick={toggleDebugHelp} 
                    className="ml-2 underline text-blue-600 hover:text-blue-800"
                  >
                    {debugHelp ? 'Hide Help' : 'Show Troubleshooting Tips'}
                  </button>
                </p>
                
                <button 
                  onClick={toggleAdvancedDebug}
                  className="mt-2 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                >
                  {advancedDebug ? 'Hide Advanced Debug' : 'Show Advanced Debug Tools'}
                </button>
                
                {advancedDebug && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                    <h4 className="font-medium text-gray-800 mb-2">Advanced API Testing</h4>
                    <div className="flex">
                      <input
                        type="text"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        className="flex-grow px-2 py-1 border border-gray-300 rounded-l"
                        placeholder="Enter API URL to test"
                      />
                      <button 
                        onClick={handleTestUrl}
                        className="px-2 py-1 bg-blue-600 text-white rounded-r"
                      >
                        Test
                      </button>
                    </div>
                    
                    {testUrlResult && (
                      <div className="mt-2">
                        {testUrlResult.status === 'checking' && <p>Testing URL...</p>}
                        
                        {testUrlResult.status === 'success' && (
                          <div>
                            <p className="text-green-600 font-medium">✓ Connection successful</p>
                            <p>Status: {testUrlResult.statusCode} ({testUrlResult.statusText})</p>
                            <p>CORS Header: {testUrlResult.headers['access-control-allow-origin'] || 'Not set'}</p>
                            <p>Content Type: {testUrlResult.headers['content-type'] || 'Not available'}</p>
                          </div>
                        )}
                        
                        {testUrlResult.status === 'error' && (
                          <div>
                            <p className="text-red-600 font-medium">✗ Connection failed</p>
                            <p>Error: {testUrlResult.message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {debugHelp && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-2 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-yellow-800 list-disc pl-5 space-y-2">
              <li>
                <strong>Try a different username:</strong> Your chosen username may already be taken.
              </li>
              <li>
                <strong>Check your email:</strong> Make sure it's not already registered in the system.
              </li>
              <li>
                <strong>Use a stronger password:</strong> Example: <code className="bg-gray-100 px-1">SecurePass123!</code>
              </li>
              <li>
                <strong>API connection issues:</strong> The server might be temporarily unavailable. Try again later.
              </li>
              <li>
                <strong>Clear browser cache:</strong> Try clearing your browser cache and cookies.
              </li>
              <li>
                <strong>Try a different browser:</strong> Some browsers may have compatibility issues.
              </li>
            </ul>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4">
            <p className="text-green-700">
              Registration successful! Please check your email to verify your account.
            </p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-1 gap-y-2">
              <div>
                <label htmlFor="email" className="sr-only">Email address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address *"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="sr-only">Username *</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username *"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="first_name" className="sr-only">First Name *</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="First Name *"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="sr-only">Last Name *</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Last Name *"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="position" className="sr-only">Position</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  autoComplete="organization-title"
                  value={formData.position}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Position (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="sr-only">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Phone (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password *"
                />
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full bg-${passwordStrength.color}-500`} 
                          style={{ width: `${(passwordStrength.score * 20)}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 text-sm text-${passwordStrength.color}-500`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-500 mt-1 pl-2">
                      <li className={formData.password.length >= 8 ? 'text-green-500' : ''}>
                        ✓ Min. 8 characters
                      </li>
                      <li className={(/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) ? 'text-green-500' : ''}>
                        ✓ Uppercase & lowercase letters
                      </li>
                      <li className={/\d/.test(formData.password) ? 'text-green-500' : ''}>
                        ✓ Numbers
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : ''}>
                        ✓ Special characters
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="password2" className="sr-only">Confirm Password *</label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password *"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (loading || success) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Registering...' : success ? 'Registration Successful' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center mt-4">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 