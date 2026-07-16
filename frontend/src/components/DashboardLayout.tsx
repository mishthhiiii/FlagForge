import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  SlidersHorizontal,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Layers,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Badge } from './Badge';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedEnvironment,
    setSelectedEnvironment,
    environments,
    showToast,
    currentUser,
    setCurrentUser
  } = useFlags();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: SlidersHorizontal },
    { name: 'Feature Flags', path: '/flags', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const currentEnvDetails = environments.find((e) => e.id === selectedEnvironment) || environments[0];

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of FlagForge workspace', 'info');
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching flags and configurations for "${searchQuery}"`, 'info');
      navigate(`/flags?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans">
      {/* Decorative radial gradients for the background layout */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/3 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#09090b] border-r border-zinc-800 flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2.5">
          <div className="p-1.5 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/25">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white flex items-center gap-1">
            FlagForge
          </span>
          <Badge variant="purple" className="text-[10px] py-0 px-1.5 ml-auto border-violet-500/10 bg-violet-500/5 font-mono">
            SaaS
          </Badge>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700/50 rounded-md z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-4.5 w-4.5 z-10 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span className="z-10">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-zinc-800 space-y-4">
          {currentUser && (
            <div className="flex items-center gap-3 px-2 py-1">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover border border-zinc-800"
              />
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold text-zinc-200 truncate">{currentUser.name}</h4>
                <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer select-none"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex-grow flex flex-col min-w-0 z-10">
        {/* --- HEADER NAVBAR --- */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between px-4 lg:px-8 z-15 select-none">
          {/* Left: Mobile Toggle & Global Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search form */}
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative w-72">
              <Search className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search feature flags (Press Enter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md text-xs pl-9 pr-3.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-300 transition-all"
              />
            </form>
          </div>

          {/* Right: Env Switcher, Notifications, User Dropdown */}
          <div className="flex items-center gap-3.5">
            {/* Live Environment Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-semibold hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  selectedEnvironment === 'production'
                    ? 'bg-emerald-400'
                    : selectedEnvironment === 'staging'
                    ? 'bg-amber-400'
                    : 'bg-blue-400'
                }`} />
                <span className="text-zinc-300 font-mono">ENV:</span>
                <span className="text-zinc-100 capitalize">{selectedEnvironment}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500 ml-1" />
              </button>

              {isEnvDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsEnvDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-zinc-950 border border-zinc-800 rounded-md shadow-xl py-1.5 z-40">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3.5 py-1">
                      Switch Environment
                    </p>
                    {environments.map((env) => (
                      <button
                        key={env.id}
                        onClick={() => {
                          setSelectedEnvironment(env.id as any);
                          setIsEnvDropdownOpen(false);
                          showToast(`Switched active workspace scope to ${env.name}`, 'info');
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-zinc-900 ${
                          selectedEnvironment === env.id ? 'text-indigo-400 font-semibold bg-zinc-900/40' : 'text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            env.id === 'production'
                              ? 'bg-emerald-400'
                              : env.id === 'staging'
                              ? 'bg-amber-400'
                              : 'bg-blue-400'
                          }`} />
                          <span>{env.name}</span>
                        </div>
                        {selectedEnvironment === env.id && (
                          <span className="text-[10px] font-mono px-1 bg-indigo-500/10 text-indigo-400 rounded">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification alert */}
            <button
              onClick={() => showToast('All cloud nodes healthy. No configuration issues.', 'success')}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 rounded-md cursor-pointer flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                {currentUser && (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover border border-zinc-800"
                  />
                )}
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-56 bg-zinc-950 border border-zinc-800 rounded-md shadow-xl py-1.5 z-40">
                    <div className="px-3.5 py-2 border-b border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-200">{currentUser?.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
                    >
                      Project Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        showToast('Cli config instructions are found in the settings tab.', 'info');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      Configure CLI
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/5 cursor-pointer border-t border-zinc-800 mt-1.5"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* --- DYNAMIC BODY PANE --- */}
        <main className="flex-grow overflow-y-auto px-4 lg:px-8 py-8 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* --- MOBILE COLLAPSED MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 bg-zinc-950 border-r border-zinc-900 h-full flex flex-col p-6 z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <Terminal className="h-5 w-5 text-indigo-500" />
                  <span className="text-lg font-bold text-white tracking-tight">FlagForge</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/15 rounded-lg" />
                      )}
                      <Icon className={`h-4.5 w-4.5 z-10 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span className="z-10">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="border-t border-zinc-900 pt-6 mt-auto space-y-4">
                {currentUser && (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-full border border-zinc-800"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">{currentUser.name}</h4>
                      <p className="text-xs text-zinc-500">{currentUser.email}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DashboardLayout;
