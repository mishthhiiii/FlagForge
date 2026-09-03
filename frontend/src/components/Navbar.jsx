import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './common/Button.jsx';

export function Navbar({ onOpenCreateModal }) {
  const { user } = useAuth();
  const { selectedEnv, setSelectedEnv, searchQuery, setSearchQuery } = useFlags();

  const environments = ['All', 'Development', 'Staging', 'Production'];

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Search Bar */}
      <div className="flex items-center gap-3 w-72 sm:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="flag-search-input"
            type="text"
            placeholder="Search flags by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Right Controls: Environment Filter & Admin-Only Action */}
      <div className="flex items-center gap-3">
        {/* Environment Selector Pills */}
        <div className="flex items-center bg-[#0f172a] border border-[#1e293b] rounded-lg p-1">
          {environments.map((env) => (
            <button
              key={env}
              id={`filter-env-${env.toLowerCase()}`}
              onClick={() => setSelectedEnv(env)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                selectedEnv === env
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {env}
            </button>
          ))}
        </div>

        {/* Create Flag Button - Visible exclusively for Admin role */}
        {user?.role === 'Admin' && (
          <Button
            id="btn-create-new-flag"
            variant="primary"
            icon={Plus}
            onClick={onOpenCreateModal}
          >
            New Flag
          </Button>
        )}
      </div>
    </header>
  );
}
