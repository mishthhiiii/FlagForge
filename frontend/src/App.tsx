import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FlagProvider, useFlags } from './context/FlagContext';
import { ToastContainer } from './components/Toast';

// Pages Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeatureFlags from './pages/FeatureFlags';
import FlagForm from './pages/FlagForm';
import FlagDetails from './pages/FlagDetails';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Layout Imports
import DashboardLayout from './components/DashboardLayout';

/**
 * Route protection wrapper.
 * Ensures workspace access requires a logged-in user context.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useFlags();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page, preserving path state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <FlagProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Access */}
          <Route path="/login" element={<Login />} />

          {/* Secure Workspace Access */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flags"
            element={
              <ProtectedRoute>
                <FeatureFlags />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flags/new"
            element={
              <ProtectedRoute>
                <FlagForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flags/:id"
            element={
              <ProtectedRoute>
                <FlagDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flags/:id/edit"
            element={
              <ProtectedRoute>
                <FlagForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Wildcard router fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global Slide-up toast triggers */}
      <ToastContainer />
    </FlagProvider>
  );
}
