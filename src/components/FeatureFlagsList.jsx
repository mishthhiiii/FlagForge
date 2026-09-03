import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Search,
  Filter,
  Copy,
  Check
} from 'lucide-react';

export default function FeatureFlagsList({ onOpenCreateFlag }) {
  const { 
    flags, 
    toggleFlagStatus, 
    updateRolloutPercentage, 
    deleteFlag, 
    currentEnv, 
    environments,
    searchQuery,
    generateAiRecommendation,
    setActiveTab
  } = useApp();

  const [copiedKey, setCopiedKey] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          flag.flag_key.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'active') {
      return matchesSearch && flag.environments[currentEnv]?.is_enabled;
    }
    if (filterType === 'inactive') {
      return matchesSearch && !flag.environments[currentEnv]?.is_enabled;
    }
    return matchesSearch;
  });

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Feature Flags</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage flag targets, rollout weights, and environment overrides
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="flex items-center bg-[#121620] border border-[#1e232d] rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all' ? 'bg-[#1a1f2c] text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All ({flags.length})
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterType('inactive')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'inactive' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Disabled
            </button>
          </div>

          <button
            onClick={onOpenCreateFlag}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flag</span>
          </button>
        </div>
      </div>

      {/* Flags List Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#f8fafc]">
            <thead className="bg-[#1e293b]/60 text-[#64748b] font-bold uppercase tracking-wider text-[10px] border-b border-[#1e293b]">
              <tr>
                <th className="px-6 py-3.5">Flag Name & Key</th>
                <th className="px-6 py-3.5">Environment Status</th>
                <th className="px-6 py-3.5">Rollout % ({currentEnv})</th>
                <th className="px-6 py-3.5">Environments Matrix</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#94a3b8]">
                    No feature flags found matching query.
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const currentTarget = flag.environments[currentEnv] || { is_enabled: false, rollout_percentage: 0 };

                  return (
                    <tr key={flag.id} className="hover:bg-[#1e293b]/50 transition-colors group">
                      {/* Name & Key */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-[#f8fafc] text-sm flex items-center gap-2">
                            <span>{flag.name}</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                              {flag.flag_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[#818cf8] text-[11px] bg-[#1e1b4b] px-2 py-0.5 rounded border border-[#3730a3]">
                              {flag.flag_key}
                            </span>
                            <button
                              onClick={() => handleCopyKey(flag.flag_key)}
                              className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                              title="Copy Flag Key"
                            >
                              {copiedKey === flag.flag_key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[#94a3b8] text-xs mt-1.5 line-clamp-1">{flag.description}</p>
                        </div>
                      </td>

                      {/* Enable/Disable Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFlagStatus(flag.id, currentEnv)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            currentTarget.is_enabled ? 'bg-emerald-600' : 'bg-[#334155]'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              currentTarget.is_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`block text-[10px] font-semibold mt-1 uppercase ${
                          currentTarget.is_enabled ? 'text-emerald-400' : 'text-[#64748b]'
                        }`}>
                          {currentTarget.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>

                      {/* Rollout Percentage Slider */}
                      <td className="px-6 py-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#94a3b8] font-medium">Target Load:</span>
                            <span className="font-bold text-indigo-400">{currentTarget.rollout_percentage}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentTarget.rollout_percentage}
                            onChange={(e) => updateRolloutPercentage(flag.id, currentEnv, e.target.value)}
                            disabled={!currentTarget.is_enabled}
                            className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                          />
                        </div>
                      </td>

                      {/* Environments Grid Matrix */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {environments.map((env) => {
                            const eState = flag.environments[env.env_key];
                            const isAct = eState && eState.is_enabled;
                            return (
                              <div
                                key={env.id}
                                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${
                                  isAct
                                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                                    : 'bg-[#1e293b]/50 border-[#334155]/50 text-[#64748b]'
                                }`}
                                title={`${env.name}: ${isAct ? `${eState.rollout_percentage}%` : 'Off'}`}
                              >
                                {env.env_key.substring(0, 3)}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              generateAiRecommendation(flag.flag_key);
                              setActiveTab('ai-advisor');
                            }}
                            className="p-1.5 text-indigo-300 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-xs flex items-center gap-1 transition-colors"
                            title="AI Recommendation"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteFlag(flag.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/30 text-xs transition-colors"
                            title="Delete Flag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
