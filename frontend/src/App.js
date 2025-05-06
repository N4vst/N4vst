import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PassportViewerPage from './pages/PassportViewerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MagicLoginPage from './pages/MagicLoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import PassportFormPage from './pages/PassportFormPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/passports/:id" element={<PassportViewerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/magic-login/:token" element={<MagicLoginPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard/passport/new" element={
              <PrivateRoute>
                <PassportFormPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard/passport/edit/:id" element={
              <PrivateRoute>
                <PassportFormPage />
              </PrivateRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 