import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import PassportViewer from './PassportViewer';

// Mock axios to control API responses
jest.mock('axios');

describe('PassportViewer Component', () => {
  const mockPassport = {
    id: '12345',
    name: 'Test Product',
    qr_code: 'TEST-QR-CODE-123',
    sustainability_data: {
      carbon_footprint: 25.5,
      recyclable: true,
      materials: ['aluminum', 'plastic'],
    },
    created_at: '2023-05-01T10:00:00Z',
    updated_at: '2023-05-10T15:30:00Z',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<PassportViewer passportId="12345" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('fetches and displays passport data successfully', async () => {
    axios.get.mockResolvedValue({ data: mockPassport });
    
    render(<PassportViewer passportId="12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText(/TEST-QR-CODE-123/)).toBeInTheDocument();
      expect(screen.getByText('carbon_footprint')).toBeInTheDocument();
      expect(screen.getByText('25.5')).toBeInTheDocument();
    });
    
    // Verify localStorage was called with correct args
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'dpp_passport_12345', 
      JSON.stringify(mockPassport)
    );
  });

  test('shows error message when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('API error'));
    window.localStorage.getItem.mockReturnValue(null); // No cached data
    
    render(<PassportViewer passportId="12345" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load passport data/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  test('uses cached data when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('API error'));
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockPassport));
    
    render(<PassportViewer passportId="12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText(/Offline Mode/)).toBeInTheDocument();
    });
  });

  test('shows offline notification when browser is offline', async () => {
    axios.get.mockResolvedValue({ data: mockPassport });
    Object.defineProperty(window.navigator, 'onLine', { value: false });
    
    render(<PassportViewer passportId="12345" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Offline Mode/)).toBeInTheDocument();
    });
  });

  test('handles empty sustainability_data', async () => {
    const passportWithoutData = {
      ...mockPassport,
      sustainability_data: {},
    };
    
    axios.get.mockResolvedValue({ data: passportWithoutData });
    
    render(<PassportViewer passportId="12345" />);
    
    await waitFor(() => {
      expect(screen.getByText('No sustainability data available')).toBeInTheDocument();
    });
  });
}); 