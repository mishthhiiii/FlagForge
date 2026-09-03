import React, { useState } from 'react';
import { Flag, Sparkles, Sliders, AlertCircle, Check, Pause, Play, Pencil, Trash2 } from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { StatusBadge, EnvironmentBadge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { CreateFlagModal } from '../components/CreateFlagModal.jsx';

export function FeatureFlagsPage({ onNavigate }) {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const isAdmin = user?.role === 'Admin';

  const {
    filteredFlags,
    updateRolloutPercentage,
    updateFlagStatus,
    deleteFlag,
    selectedEnv,
    setSelectedEnv,
    evaluateAiRecommendation
  } = useFlags();

  const [statusFilter, setStatusFilter] = useState('All');
  const [editingFlag, setEditingFlag] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayedFlags = filteredFlags.filter((f) => {
    if (statusFilter === 'All') return true;
    return f.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleInspectAi = async (flagId) => {
    await evaluateAiRecommendation(flagId);
    if (onNavigate) {
      onNavigate('analytics');
    }
  };

  const handleDeleteFlag = (flag) => {
    if (window.confirm(`Are you sure you want to permanently delete flag '${flag.name}'?`)) {
      deleteFlag(flag.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Status Filters & Environment Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Feature Flag Directory</h2>
          <p className="text-xs text-slate-400">
            Control feature releases across environments with granular percentage rollout
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] p-1 rounded-lg">
          {['All', 'Active', 'Paused', 'Draft'].map((status) => (
            <button
              key={status}
              id={`filter-status-${status.toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Flag List Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Flag & Description</th>
                <th className="py-3 px-3">Environment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Rollout Percentage</th>
                <th className="py-3 px-3">Telemetry</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {displayedFlags.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No feature flags match current filter criteria in {selectedEnv} environment.
                  </td>
                </tr>
              ) : (
                displayedFlags.map((flag) => {
                  const errorRate = flag.metrics?.error_rate ?? 0.2;
                  const responseTime = flag.metrics?.response_time ?? 110;
                  const apiFailures = flag.metrics?.api_failures ?? 0;

                  return (
                    <tr key={flag.id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Name & Desc */}
                      <td className="py-4 px-3 max-w-xs">
                        <div className="font-mono font-bold text-slate-100 flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{flag.name}</span>
                        </div>
                        {flag.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {flag.description}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Updated: {flag.updated_at || flag.created_at}
                        </div>
                      </td>

                      {/* Environment */}
                      <td className="py-4 px-3">
                        <EnvironmentBadge env={flag.environment} />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <StatusBadge status={flag.status} />
                      </td>

                      {/* Rollout Slider */}
                      <td className="py-4 px-3 w-56">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Canary Traffic:</span>
                            <span className="font-mono font-bold text-indigo-400">
                              {flag.rollout_percentage}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            disabled={isViewer}
                            value={flag.rollout_percentage}
                            onChange={(e) => updateRolloutPercentage(flag.id, Number(e.target.value))}
                            title={isViewer ? 'Rollout adjustments disabled for Viewer' : undefined}
                            className={`w-full accent-indigo-500 ${isViewer ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>

                      {/* Telemetry Metrics */}
                      <td className="py-4 px-3">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Err:</span>
                            <span className={errorRate > 3.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {errorRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Lat:</span>
                            <span className="text-slate-300">{responseTime}ms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Fail:</span>
                            <span className={apiFailures > 20 ? 'text-rose-400' : 'text-slate-400'}>
                              {apiFailures} reqs
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectAi(flag.id)}
                            title="Analyze rollout risk"
                            id={`btn-ai-check-${flag.id}`}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Insights</span>
                          </button>

                          <button
                            disabled={isViewer}
                            id={`btn-toggle-flag-${flag.id}`}
                            onClick={() =>
                              updateFlagStatus(
                                flag.id,
                                flag.status === 'Active' ? 'Paused' : 'Active'
                              )
                            }
                            title={isViewer ? 'Status mutations disabled for Viewer' : undefined}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isViewer
                                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                                : flag.status === 'Active'
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 cursor-pointer'
                            }`}
                          >
                            {flag.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>

                          {!isViewer && (
                            <button
                              id={`btn-edit-flag-${flag.id}`}
                              onClick={() => {
                                setEditingFlag(flag);
                                setIsEditModalOpen(true);
                              }}
                              title="Edit flag configuration"
                              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              id={`btn-delete-flag-${flag.id}`}
                              onClick={() => handleDeleteFlag(flag)}
                              title="Delete flag"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Flag Modal */}
      <CreateFlagModal
        isOpen={isEditModalOpen}
        flagToEdit={editingFlag}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFlag(null);
        }}
      />
    </div>
  );
}
