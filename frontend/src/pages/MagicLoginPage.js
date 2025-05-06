import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * MagicLoginPage Component
 * 
 * Handles login through magic links
 */
const MagicLoginPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid login link. Please request a new one.');
        setVerifying(false);
        return;
      }

      try {
        // Verify the token
        const response = await axios.post('/api/users/magic-link/verify/', { token });
        
        // Store the tokens in localStorage
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        setSuccess(true);
        setVerifying(false);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } catch (err) {
        console.error('Magic link verification error:', err);
        setError('This login link is invalid or expired. Please request a new one.');
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-blue-600">Magic Link Login</h2>
          <p className="mt-2 text-sm text-gray-600">Logging you in securely...</p>
        </div>
        
        {verifying && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mt-4">
            <p className="text-red-700">{error}</p>
            <div className="mt-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mt-4">
            <p className="text-green-700">Login successful! Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicLoginPage; 