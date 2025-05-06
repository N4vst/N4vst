import React from 'react';

/**
 * Footer Component
 * 
 * The footer section for the DPP application.
 * Contains copyright information and additional links.
 */
const Footer = () => {
  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Digital Product Passport App | 
              <span className="ml-1">Licensed under Apache 2.0</span>
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://ec.europa.eu/environment/topics/circular-economy/index_en.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              EU Circular Economy
            </a>
            <a 
              href="https://ec.europa.eu/environment/eussd/smgp/PEFCR_OEFSR_en.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Product Environmental Footprint
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            This application is inspired by Sylius' API-first design and is optimized for open-source contributions.
            The frontend follows Airbnb JavaScript style guidelines and uses Tailwind CSS for styling.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 