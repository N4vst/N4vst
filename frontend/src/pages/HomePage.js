import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * HomePage Component
 * 
 * The landing page for the DPP application that lists all available passports.
 * Demonstrates Sylius-inspired API-first approach and clean, responsive UI.
 */
const HomePage = () => {
  const [passports, setPassports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPassports = async () => {
      try {
        const response = await axios.get('/api/passports/');
        setPassports(response.data.results || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching passports:', err);
        setError('Failed to load passports. Please try again later.');
        setLoading(false);
      }
    };

    fetchPassports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Digital Product Passports</h1>
        <p className="text-gray-600">
          Explore digital passports for products compliant with EU regulations
        </p>
      </div>

      {passports.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">No product passports found. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passports.map((passport) => (
            <Link 
              key={passport.id} 
              to={`/passports/${passport.id}`}
              className="bg-white rounded shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-2">{passport.name}</h2>
              <p className="text-gray-600 mb-4">QR Code: {passport.qr_code}</p>
              <p className="text-sm text-gray-600">
                Updated: {new Date(passport.updated_at).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <span className="inline-block bg-blue-600 text-white py-2 px-4 rounded">
                  View Details
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-100 rounded">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">What is a Digital Product Passport?</h2>
        <p className="text-gray-700 mb-4">
          A Digital Product Passport (DPP) is an electronic record that contains detailed information
          about a product's components, materials, chemical substances, and information related to
          reparability, spare parts, and proper disposal. It's a key initiative in the EU's strategy
          towards a more sustainable and circular economy.
        </p>
        <p className="text-gray-700">
          DPPs help consumers make informed choices, enable businesses to track their supply chains,
          and assist authorities in monitoring compliance with sustainability regulations.
        </p>
      </div>
    </div>
  );
};

export default HomePage; 