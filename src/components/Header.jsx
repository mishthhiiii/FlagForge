import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Search, Bell, Plus, ChevronDown, Layers, Shield, User } from 'lucide-react';

export default function Header({ onOpenCreateFlag, onOpenCreateProject }) {
  const { 
    currentEnv, 
    setCurrentEnv, 
    environments, 
    searchQuery, 
    setSearchQuery,
    currentUser,
    activeProject,
    setActiveProject,
    projects
  } = useApp();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0f172a]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Search Bar & Project Switcher */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Project Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155]/50 text-xs font-semibold text-gray-200 px-3 py-1.5 rounded-lg border border-[#334155] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{activeProject ? activeProject.name : 'Select Project'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#0f172a] border border-[#1e293b] rounded-lg shadow-xl p-1 z-30">
              <div className="text-[10px] font-semibold text-gray-500 uppercase px-3 py-1.5">Projects</div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProject(p);
                    setShowProjectDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    activeProject && activeProject.id === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-[#1e293b]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <div className="border-t border-[#1e293b] mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowProjectDropdown(false);
                    onOpenCreateProject();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded text-xs font-medium text-indigo-400 hover:bg-[#1e293b] flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feature flags (Press Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Environment Selector Badge */}
        <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-[#334155]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ENV:</span>
          <select
            value={currentEnv}
            onChange={(e) => setCurrentEnv(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none capitalize cursor-pointer"
          >
            {environments.map((e) => (
              <option key={e.id} value={e.env_key} className="bg-[#0f172a] text-gray-200">
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <button className="p-2 text-gray-400 hover:text-white bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        {/* Create Flag Button */}
        <button
          onClick={onOpenCreateFlag}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Feature Flag</span>
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10 ml-1">
          SA
        </div>
      </div>
    </header>
  );
}
