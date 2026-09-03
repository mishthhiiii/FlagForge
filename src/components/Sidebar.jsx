import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  LayoutDashboard, 
  Flag, 
  BarChart3, 
  Settings, 
  Sparkles, 
  FileText, 
  Layers,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles, badge: 'Gemini' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#0f172a] border-r border-[#1e293b] flex flex-col justify-between h-screen sticky top-0 select-none z-20">
      <div>
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1e293b]">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">FlagForge</span>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              SaaS
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e293b] text-[#f8fafc] font-semibold shadow-sm border border-[#334155]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-[#94a3b8]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1e293b]">
        <div className="bg-[#1e293b] p-3 rounded-lg border border-[#334155] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-medium text-gray-200">MySQL & Flask Sync</p>
            <p className="text-[11px] text-gray-400">Connected to v1.4.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
