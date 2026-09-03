import React from 'react';
import {
  LayoutDashboard,
  Flag,
  BarChart3,
  History,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'analytics', label: 'Analytics & AI', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];

  const role = user?.role || 'Viewer';

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#1e293b]">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-extrabold text-base">
            FF
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-100 tracking-tight flex items-center gap-1.5">
              FlagForge
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Beta
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Feature Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Role Profile */}
      <div className="p-4 border-t border-[#1e293b]">
        <div className="bg-[#0f172a] border border-[#1e293b] p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-200 truncate" id="sidebar-user-name">
                  {user?.name || (role === 'Admin' ? 'Project Admin' : role === 'Developer' ? 'Developer' : 'Viewer')}
                </p>
                <span
                  id="user-role-badge"
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                    role === 'Admin'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : role === 'Developer'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate" id="sidebar-user-email">
                {user?.email || (role === 'Admin' ? 'admin@flagforge.local' : role === 'Developer' ? 'developer@flagforge.local' : 'viewer@flagforge.local')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            id="btn-sidebar-logout"
            title="Log out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
