import React, { useState } from 'react';
import {
  Flag,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { StatusBadge, EnvironmentBadge, RecommendationBadge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';

export function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const {
    flags,
    filteredFlags,
    selectedEnv,
    updateRolloutPercentage,
    updateFlagStatus,
    auditLogs,
    evaluateAiRecommendation,
    activeRecommendation,
    isAiLoading,
    selectedFlagId,
    setSelectedFlagId
  } = useFlags();

  // Environment-aware & real-time search filtered flag dataset
  const displayedFlags = filteredFlags;

  const totalCount = displayedFlags.length;
  const activeCount = displayedFlags.filter(f => f.status === 'Active').length;
  const avgRollout = Math.round(
    displayedFlags.reduce((acc, f) => acc + (f.rollout_percentage || 0), 0) / (totalCount || 1)
  );
  const highRiskCount = displayedFlags.filter(f => (f.aiRecommendation?.risk_score || 0) >= 70).length;

  // Environment-context-aware flag pool for AI recommendation panel
  const envFlags = flags.filter(flag => {
    if (selectedEnv === 'All') return true;
    const envFilter = selectedEnv.toLowerCase();
    const flagEnv = flag.environment.toLowerCase();
    return flagEnv === envFilter ||
      (envFilter === 'staging' && flagEnv === 'testing') ||
      (envFilter === 'testing' && flagEnv === 'staging');
  });

  // Pick active flag strictly within current environment context
  const currentFlag = envFlags.find(f => f.id === Number(selectedFlagId)) || envFlags[0] || null;

  // Context-aware recommendation: tie activeRecommendation to currentFlag, or fall back to flag's recommendation
  const currentRec = currentFlag
    ? (activeRecommendation && (activeRecommendation.flagId === currentFlag.id || activeRecommendation.flag_id === currentFlag.id)
        ? activeRecommendation
        : currentFlag.aiRecommendation || null)
    : null;

  const handleRunAi = async () => {
    if (currentFlag) {
      await evaluateAiRecommendation(currentFlag.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards - Dynamically reflect active environment filter & search query */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">
              {selectedEnv === 'All' ? 'Total Feature Flags' : `${selectedEnv} Flags`}
            </p>
            <p className="text-2xl font-black text-white" id="stat-total-flags">{totalCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">
              {selectedEnv === 'All' ? 'Active in Production' : `Active in ${selectedEnv}`}
            </p>
            <p className="text-2xl font-black text-white" id="stat-active-flags">
              {selectedEnv === 'All'
                ? flags.filter(f => f.environment.toLowerCase() === 'production' && f.status === 'Active').length
                : activeCount}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Average Rollout</p>
            <p className="text-2xl font-black text-white" id="stat-avg-rollout">{avgRollout}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Risk Alerts</p>
            <p className="text-2xl font-black text-white" id="stat-risk-alerts">{highRiskCount}</p>
          </div>
        </Card>
      </div>

      {/* AI Rollout Insights Card */}
      <Card
        title="AI Rollout Insights"
        subtitle="Analyze rollout health and deployment risk."
        action={
          envFlags.length > 0 && currentFlag ? (
            <div className="flex items-center gap-3">
              <select
                value={currentFlag?.id || ''}
                id="select-dashboard-ai-flag"
                onChange={(e) => setSelectedFlagId(Number(e.target.value))}
                className="bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                {envFlags.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.environment})
                  </option>
                ))}
              </select>
              <Button
                id="btn-dashboard-run-ai"
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                disabled={isAiLoading || !currentFlag}
                onClick={handleRunAi}
              >
                {isAiLoading ? 'Analyzing...' : 'Analyze Risk'}
              </Button>
            </div>
          ) : null
        }
      >
        {!currentFlag || !currentRec ? (
          <div className="py-8 px-4 text-center text-slate-400">
            <Sparkles className="w-7 h-7 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No recommendation available for this environment.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              No telemetry recommendations currently generated for {selectedEnv}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* 1. Risk Score & 4. Reliability Column */}
            <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Risk Score</div>
                <div className="relative flex items-center justify-center my-1.5">
                  <span
                    className={`text-4xl font-black ${
                      (currentRec.riskScore ?? currentRec.risk_score) >= 75
                        ? 'text-rose-400'
                        : (currentRec.riskScore ?? currentRec.risk_score) >= 45
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {currentRec.riskScore ?? currentRec.risk_score ?? 18}
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-1">/100</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (currentRec.riskScore ?? currentRec.risk_score) >= 75
                        ? 'bg-rose-500'
                        : (currentRec.riskScore ?? currentRec.risk_score) >= 45
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${currentRec.riskScore ?? currentRec.risk_score ?? 18}%` }}
                  ></div>
                </div>
              </div>

              {/* 4. Reliability */}
              <div className="mt-3 pt-2.5 border-t border-[#1e293b]/70 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Reliability</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {currentRec.reliabilityScore ??
                    currentRec.reliability_score ??
                    currentRec.confidenceScore ??
                    currentRec.confidence_score ??
                    91}
                  %
                </span>
              </div>
            </div>

            {/* 2. Recommendation & 3. Why this recommendation Column */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-3 bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4">
              {/* 2. Recommendation */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1e293b]/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400">Recommendation:</span>
                  <RecommendationBadge recommendation={currentRec.recommendation} />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Target: <strong className="text-slate-200">{currentFlag?.name}</strong> ({currentFlag?.environment})
                </span>
              </div>

              {/* 3. Why this recommendation */}
              <div className="space-y-1.5 flex-1">
                <div className="text-xs font-semibold text-slate-400">Why this recommendation</div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#0f172a] p-3 rounded-lg border border-[#1e293b]">
                  {currentRec.reason}
                </p>
              </div>

              {/* Guardrail Note */}
              <p className="text-[11px] text-slate-400 italic pt-0.5">
                Developers always remain in control of feature releases.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Flag Management Quick Control Table */}
      <Card
        title={`Live Rollout & Status Controls (${selectedEnv})`}
        subtitle="Real-time percentage throttling and state toggling in active environment"
        action={
          <Button variant="outline" size="sm" onClick={() => onNavigate('flags')} icon={ArrowRight}>
            View All Flags
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Flag Name</th>
                <th className="py-3 px-2">Environment</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Rollout Throttling</th>
                <th className="py-3 px-2">Error Rate</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {displayedFlags.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">
                    No feature flags found matching current filters in {selectedEnv} environment.
                  </td>
                </tr>
              ) : (
                displayedFlags.slice(0, 5).map((flag) => (
                  <tr key={flag.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-200">
                      {flag.name}
                    </td>
                    <td className="py-3 px-2">
                      <EnvironmentBadge env={flag.environment} />
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={flag.status} />
                    </td>
                    <td className="py-3 px-2 w-48">
                      <div className="flex items-center gap-2">
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
                        <span className="font-mono text-[11px] text-indigo-400 font-bold w-9 text-right">
                          {flag.rollout_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-300">
                      <span className={flag.metrics?.error_rate > 3.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {flag.metrics?.error_rate?.toFixed(2) || '0.20'}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        disabled={isViewer}
                        onClick={() =>
                          updateFlagStatus(flag.id, flag.status === 'Active' ? 'Paused' : 'Active')
                        }
                        title={isViewer ? 'Status mutations disabled for Viewer' : undefined}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isViewer
                            ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                            : flag.status === 'Active'
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 cursor-pointer'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer'
                        }`}
                      >
                        {flag.status === 'Active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Audit Trail Snippet */}
      <Card
        title="Recent Change History (Audit Log)"
        subtitle="Immutable security trail of flag mutations"
        action={
          <Button variant="outline" size="sm" onClick={() => onNavigate('audit')} icon={ArrowRight}>
            Full Log
          </Button>
        }
      >
        <div className="space-y-2.5">
          {auditLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2.5 bg-[#0a0f1d] border border-[#1e293b] rounded-lg text-xs"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="text-slate-300 font-mono">{log.action}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-indigo-400 font-semibold text-[11px]">{log.user_name}</span>
                <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
