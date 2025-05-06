import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * PassportViewer Component
 * 
 * Displays Digital Product Passport data with offline support using localStorage.
 * This component follows Sylius-inspired developer-friendly design principles:
 * - API-first approach
 * - Separation of concerns
 * - Clear state management
 * - Progressive enhancement (works offline)
 * 
 * @param {string} passportId - The ID of the passport to display
 */
const PassportViewer = ({ passportId }) => {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Online status handler
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch passport data function
  const fetchPassport = useCallback(async () => {
    // Reset states
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API
      const response = await axios.get(`/api/passports/${passportId}/`);
      const data = response.data;
      
      // Store in localStorage for offline access
      localStorage.setItem(`dpp_passport_${passportId}`, JSON.stringify(data));
      setPassport(data);
      setLoading(false);
    } catch (err) {
      // If API fetch fails, try to get from localStorage
      const cachedData = localStorage.getItem(`dpp_passport_${passportId}`);
      
      if (cachedData) {
        // If we have cached data, use it
        setPassport(JSON.parse(cachedData));
        setIsOffline(true); // Force offline mode since we're using cached data
        setLoading(false);
      } else {
        // No cached data available
        setError('Failed to load passport data and no cached data available');
        setLoading(false);
      }
    }
  }, [passportId]);

  // Load data on component mount or when passportId changes
  useEffect(() => {
    fetchPassport();
  }, [fetchPassport, passportId]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchPassport();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-yellow-700">Passport not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-md p-6 mb-6">
      {/* Offline notification */}
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-800">
            <span className="font-semibold">Offline Mode:</span> You're viewing cached data
          </p>
        </div>
      )}

      {/* Passport header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-4">
        <h2 className="text-3xl font-bold text-blue-600">{passport.name}</h2>
        <p className="text-gray-600">QR Code: {passport.qr_code}</p>
      </div>

      {/* Passport meta information */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <div>Created: {new Date(passport.created_at).toLocaleDateString()}</div>
          <div>Updated: {new Date(passport.updated_at).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Sustainability data */}
      <div>
        <h3 className="text-xl font-semibold text-blue-600 mb-2">Sustainability Information</h3>
        {passport.sustainability_data && Object.keys(passport.sustainability_data).length > 0 ? (
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <table className="w-full">
              <tbody>
                {Object.entries(passport.sustainability_data).map(([key, value]) => (
                  <tr key={key} className="border-t">
                    <td className="py-2 font-medium">{key}</td>
                    <td className="py-2">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No sustainability data available</p>
        )}
      </div>

      {/* Refresh button */}
      <div className="mt-6">
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          disabled={!navigator.onLine}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

PassportViewer.propTypes = {
  passportId: PropTypes.string.isRequired,
};

export default PassportViewer; 