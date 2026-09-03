import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { FlagProvider } from './context/FlagContext.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Navbar } from './components/Navbar.jsx';
import { CreateFlagModal } from './components/CreateFlagModal.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { FeatureFlagsPage } from './pages/FeatureFlagsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';

function MainAppShell() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 1. Loading state while session validation runs on startup
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30 animate-pulse">
            FF
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Validating session token...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Protected routes redirect unauthenticated users to Login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'flags':
        return <FeatureFlagsPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation - Displays actual name & role */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar - New Flag restricted to Admin */}
        <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

        {/* Dynamic Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {renderPage()}
        </main>
      </div>

      {/* Flag Creation Modal - Accessible only by Admin */}
      {user?.role === 'Admin' && (
        <CreateFlagModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FlagProvider>
        <MainAppShell />
      </FlagProvider>
    </AuthProvider>
  );
}
