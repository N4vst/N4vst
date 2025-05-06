import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Header Component
 * 
 * The main navigation header for the DPP application.
 * Uses a clean, accessible design with Tailwind CSS.
 */
const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    
    // Listen for storage events (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">DPP</span>
              </div>
              <div className="ml-2">
                <div className="text-lg font-bold text-blue-600">Digital Product Passport</div>
                <div className="text-sm text-gray-600">EU-Compliant Solution</div>
              </div>
            </Link>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Home
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Company Login
                  </Link>
                </li>
              )}
              <li>
                <a 
                  href="https://ec.europa.eu/commission/presscorner/detail/en/ip_22_2013" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  EU Regulations
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/yourusername/dpp-application" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 