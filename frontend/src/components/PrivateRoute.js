import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * PrivateRoute Component
 * 
 * Protects routes that should only be accessible to authenticated users.
 * Redirects to login page if user is not authenticated.
 */
const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // Validate token by making a request to the user endpoint
        await axios.get('/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // If the request succeeds, the token is valid
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        // If the request fails, the token is invalid
        console.error('Token validation error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    validateToken();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default PrivateRoute; 