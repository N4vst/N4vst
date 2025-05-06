import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * DashboardPage Component
 * 
 * Dashboard for companies to manage their Digital Product Passports.
 * Allows for creating, editing, and viewing product passports.
 */
const DashboardPage = () => {
  const [companyPassports, setCompanyPassports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        // Get user data
        const response = await axios.get('/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (err) {
        // If token is invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch company's passports
  useEffect(() => {
    const fetchCompanyPassports = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get('/api/passports/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          params: {
            organization: user.organization
          }
        });
        
        setCompanyPassports(response.data.results || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching passports:', err);
        setError('Failed to load passports. Please try again.');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchCompanyPassports();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Company Dashboard</h1>
          <p className="text-gray-600">Manage your Digital Product Passports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold">{user.first_name} {user.last_name}</p>
            <p className="text-sm text-gray-600">{user.organization_name || 'Organization'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Product Passports</h2>
          <Link 
            to="/dashboard/passport/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Create New Passport
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : companyPassports.length === 0 ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-700">You haven't created any product passports yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyPassports.map((passport) => (
                  <tr key={passport.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{passport.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{passport.qr_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(passport.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/dashboard/passport/edit/${passport.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <Link 
                          to={`/passports/${passport.id}`}
                          className="text-green-600 hover:text-green-900"
                          target="_blank"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a 
            href="https://ec.europa.eu/commission/presscorner/detail/en/ip_22_2013" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">EU Digital Product Passport</h3>
            <p className="text-sm text-gray-600">Learn about EU regulations for Digital Product Passports</p>
          </a>
          <a 
            href="#"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Sustainability Guidelines</h3>
            <p className="text-sm text-gray-600">Best practices for product sustainability data</p>
          </a>
          <a 
            href="#"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">Help Center</h3>
            <p className="text-sm text-gray-600">Get help with creating and managing product passports</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 