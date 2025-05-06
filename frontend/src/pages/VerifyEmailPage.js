import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * VerifyEmailPage Component
 * 
 * Handles email verification after registration
 */
const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification link. Please register again.');
        setVerifying(false);
        return;
      }

      try {
        // Verify the token
        await axios.post('/api/users/verify-email/', { token });
        
        setSuccess(true);
        setVerifying(false);
        
      } catch (err) {
        console.error('Email verification error:', err);
        setError('This verification link is invalid or expired. Please register again.');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-blue-600">Email Verification</h2>
          <p className="mt-2 text-sm text-gray-600">Verifying your email address...</p>
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
              <Link 
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none inline-block"
              >
                Register Again
              </Link>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mt-4">
            <p className="text-green-700">Email verified successfully! You can now log in to your account.</p>
            <div className="mt-4">
              <Link 
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none inline-block"
              >
                Login Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 