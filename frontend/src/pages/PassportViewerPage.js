import React, { Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';

// Lazy load the PassportViewer component for better performance
const PassportViewer = lazy(() => import('../components/PassportViewer'));

/**
 * PassportViewerPage Component
 * 
 * This page displays a Digital Product Passport by ID.
 * It demonstrates Sylius-inspired best practices:
 * - Lazy loading for performance optimization
 * - Separation of page layout from component logic
 * - Simple, clean UI that prioritizes data
 */
const PassportViewerPage = () => {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to all passports
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Digital Product Passport</h1>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading passport data...</p>
        </div>
      }>
        <PassportViewer passportId={id} />
      </Suspense>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">About Digital Product Passports</h2>
        <p className="text-gray-700 mb-4">
          Digital Product Passports (DPPs) are an EU initiative to provide comprehensive 
          product information, including sustainability data and lifecycle details. 
          They help consumers make informed choices and support the circular economy.
        </p>
        <a 
          href="https://ec.europa.eu/commission/presscorner/detail/en/ip_22_2013" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Learn more about EU Digital Product Passports
        </a>
      </div>
    </div>
  );
};

export default PassportViewerPage; 