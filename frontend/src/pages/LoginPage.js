import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * LoginPage Component
 * 
 * Provides authentication for companies to access their dashboard
 * using magic link authentication
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/users/magic-link/request/', { email });
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Magic link request error:', err);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-blue-600">Company Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your Digital Product Passports
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {magicLinkSent ? (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">
              A magic link has been sent to your email. Please check your inbox and click the link to login.
            </p>
            <p className="text-green-700 mt-2">
              The link will expire in 15 minutes.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Link...
                  </span>
                ) : 'Send Magic Link'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-sm text-center">
          <div className="mt-2">
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              Return to home page
            </Link>
          </div>
          <div className="mt-2">
            <span className="text-gray-600">Don't have an account?</span>{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 