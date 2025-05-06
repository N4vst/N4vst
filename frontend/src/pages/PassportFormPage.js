import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * PassportFormPage Component
 * 
 * Form for creating or editing Digital Product Passports.
 * Used by companies to manage their product data.
 */
const PassportFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    qr_code: '',
    sustainability_data: {}
  });
  const [sustainabilityFields, setSustainabilityFields] = useState([
    { key: 'carbon_footprint', value: '' },
    { key: 'recyclable', value: '' },
    { key: 'materials', value: '' }
  ]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch passport data if editing
  useEffect(() => {
    const fetchPassport = async () => {
      if (!isEditMode) return;
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`/api/passports/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const passport = response.data;
        setFormData({
          name: passport.name,
          qr_code: passport.qr_code,
          sustainability_data: passport.sustainability_data || {}
        });
        
        // Transform sustainability_data to fields
        const fields = [];
        for (const [key, value] of Object.entries(passport.sustainability_data || {})) {
          fields.push({
            key,
            value: Array.isArray(value) ? value.join(', ') : String(value)
          });
        }
        
        if (fields.length > 0) {
          setSustainabilityFields(fields);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching passport:', err);
        setError('Failed to load passport data');
        setLoading(false);
      }
    };
    
    fetchPassport();
  }, [id, isEditMode, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle sustainability field changes
  const handleSustainabilityChange = (index, field, value) => {
    const newFields = [...sustainabilityFields];
    newFields[index][field] = value;
    setSustainabilityFields(newFields);
  };

  // Add a new sustainability field
  const addSustainabilityField = () => {
    setSustainabilityFields([...sustainabilityFields, { key: '', value: '' }]);
  };

  // Remove sustainability field
  const removeSustainabilityField = (index) => {
    const newFields = sustainabilityFields.filter((_, i) => i !== index);
    setSustainabilityFields(newFields);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Build sustainability_data from fields
    const sustainability_data = {};
    sustainabilityFields.forEach(field => {
      if (field.key && field.value) {
        // Try to parse as number or boolean if applicable
        let value = field.value;
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value))) value = Number(value);
        else if (value.includes(',')) value = value.split(',').map(item => item.trim());
        
        sustainability_data[field.key] = value;
      }
    });
    
    const passportData = {
      ...formData,
      sustainability_data
    };
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (isEditMode) {
        // Update existing passport
        await axios.put(`/api/passports/${id}/`, passportData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Create new passport
        await axios.post('/api/passports/', passportData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error saving passport:', err);
      setError('Failed to save passport data. Please check your form and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          {isEditMode ? 'Edit Product Passport' : 'Create New Product Passport'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">
              Passport {isEditMode ? 'updated' : 'created'} successfully! Redirecting to dashboard...
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter product name"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="qr_code" className="block text-gray-700 text-sm font-bold mb-2">
              QR Code *
            </label>
            <input
              type="text"
              id="qr_code"
              name="qr_code"
              value={formData.qr_code}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter unique QR code"
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be a unique identifier for your product
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Sustainability Data
              </label>
              <button
                type="button"
                onClick={addSustainabilityField}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
              >
                + Add Field
              </button>
            </div>
            
            {sustainabilityFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleSustainabilityChange(index, 'key', e.target.value)}
                  placeholder="Field name"
                  className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleSustainabilityChange(index, 'value', e.target.value)}
                  placeholder="Value (number, text, true/false, or comma-separated list)"
                  className="flex-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                  type="button"
                  onClick={() => removeSustainabilityField(index)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded"
                >
                  ×
                </button>
              </div>
            ))}
            
            <p className="text-xs text-gray-500 mt-1">
              Add product sustainability metrics like carbon footprint, recyclability, materials, etc.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Passport' : 'Create Passport'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassportFormPage; 