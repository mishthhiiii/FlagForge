import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Gauge,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { RecommendationBadge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';

export function AnalyticsPage() {
  const {
    flags,
    selectedFlagId,
    setSelectedFlagId,
    evaluateAiRecommendation,
    activeRecommendation,
    isAiLoading,
    selectedEnv
  } = useFlags();

  // Environment-context-aware flag pool
  const envFlags = flags.filter(flag => {
    if (selectedEnv === 'All') return true;
    const envFilter = selectedEnv.toLowerCase();
    const flagEnv = flag.environment.toLowerCase();
    return flagEnv === envFilter ||
      (envFilter === 'staging' && flagEnv === 'testing') ||
      (envFilter === 'testing' && flagEnv === 'staging');
  });

  const selectedFlag = envFlags.find((f) => f.id === Number(selectedFlagId)) || envFlags[0] || flags[0];

  // Interactive telemetry sandbox simulation controls
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    error_rate: selectedFlag?.metrics?.error_rate || 1.25,
    api_failures: selectedFlag?.metrics?.api_failures || 8,
    response_time: selectedFlag?.metrics?.response_time || 280,
    user_adoption: selectedFlag?.rollout_percentage || 50
  });

  const [simulatedAiResult, setSimulatedAiResult] = useState(
    activeRecommendation || {
      riskScore: 28,
      reliabilityScore: 88,
      confidenceScore: 88,
      recommendation: 'Continue',
      reason: 'Telemetry within normal operational parameters.'
    }
  );

  const handleSimulateAi = () => {
    // Run the explainable heuristic (matching ai/analyzer.py)
    const err = Number(simulatedMetrics.error_rate);
    const resp = Number(simulatedMetrics.response_time);
    const fails = Number(simulatedMetrics.api_failures);

    let risk = 10;
    let reasons = [];

    if (err >= 5.0) {
      risk += 50;
      reasons.push(`Error rate has reached ${err.toFixed(1)}%, so disabling this feature is recommended until stability improves.`);
    } else if (err >= 2.0) {
      risk += 25;
      reasons.push(`Error rate is elevated at ${err.toFixed(2)}%. Monitoring recommended before increasing rollout.`);
    }

    if (resp >= 600) {
      risk += 25;
      reasons.push(`Response time has reached ${resp}ms, which is above the target latency threshold.`);
    } else if (resp >= 300) {
      risk += 15;
      reasons.push(`Moderate latency increase observed (${resp}ms).`);
    }

    if (fails >= 30) {
      risk += 20;
      reasons.push(`Unusual API failures detected (${fails} requests failed).`);
    }

    const totalRisk = Math.min(100, Math.max(0, risk));
    let rec = 'Continue';
    if (totalRisk >= 75) rec = 'Disable';
    else if (totalRisk >= 45) rec = 'Pause';

    setSimulatedAiResult({
      riskScore: totalRisk,
      reliabilityScore: 92,
      confidenceScore: 92,
      recommendation: rec,
      reason: reasons[0] || `Rollout health is strong with an error rate of ${err.toFixed(2)}% and response time of ${resp}ms.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Rollout Analytics & Insights</h2>
          <p className="text-xs text-slate-400">
            Real-time feature performance tracking and rollout risk assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Active Flag:</span>
          <select
            value={selectedFlag?.id}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedFlagId(id);
              const fl = flags.find((f) => f.id === id);
              if (fl) {
                setSimulatedMetrics({
                  error_rate: fl.metrics?.error_rate || 0.5,
                  api_failures: fl.metrics?.api_failures || 2,
                  response_time: fl.metrics?.response_time || 120,
                  user_adoption: fl.rollout_percentage || 25
                });
              }
            }}
            className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
          >
            {(envFlags.length > 0 ? envFlags : flags).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.environment})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-indigo-500/20">
          <p className="text-xs font-semibold text-slate-400">Error Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black ${simulatedMetrics.error_rate > 3.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {Number(simulatedMetrics.error_rate).toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">threshold: 1.0%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full ${simulatedMetrics.error_rate > 3.0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, simulatedMetrics.error_rate * 10)}%` }}
            ></div>
          </div>
        </Card>

        <Card className="border-indigo-500/20">
          <p className="text-xs font-semibold text-slate-400">P95 Response Time</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black ${simulatedMetrics.response_time > 400 ? 'text-amber-400' : 'text-indigo-400'}`}>
              {simulatedMetrics.response_time} ms
            </span>
            <span className="text-[11px] text-slate-500 font-mono">SLA: 500ms</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${Math.min(100, (simulatedMetrics.response_time / 800) * 100)}%` }}
            ></div>
          </div>
        </Card>

        <Card className="border-indigo-500/20">
          <p className="text-xs font-semibold text-slate-400">API Failures</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black ${simulatedMetrics.api_failures > 20 ? 'text-rose-400' : 'text-slate-200'}`}>
              {simulatedMetrics.api_failures}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">recent window</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full ${simulatedMetrics.api_failures > 20 ? 'bg-rose-500' : 'bg-cyan-500'}`}
              style={{ width: `${Math.min(100, simulatedMetrics.api_failures)}%` }}
            ></div>
          </div>
        </Card>

        <Card className="border-indigo-500/20">
          <p className="text-xs font-semibold text-slate-400">User Adoption / Rollout</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-cyan-400">
              {simulatedMetrics.user_adoption}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">canary traffic</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${simulatedMetrics.user_adoption}%` }}
            ></div>
          </div>
        </Card>
      </div>

      {/* AI Rollout Insights & Risk Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Rollout Insights Card */}
        <Card
          title="AI Rollout Insights"
          subtitle="Analyze rollout health and deployment risk."
        >
          <div className="space-y-3.5">
            {/* 1. Risk Score & 2. Recommendation */}
            <div className="p-3.5 bg-[#0a0f1d] border border-[#1e293b] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Risk Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl font-black ${
                    simulatedAiResult.riskScore >= 75
                      ? 'text-rose-400'
                      : simulatedAiResult.riskScore >= 45
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {simulatedAiResult.riskScore}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Recommendation</span>
                <RecommendationBadge recommendation={simulatedAiResult.recommendation} />
              </div>
            </div>

            {/* 3. Why this recommendation */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Why this recommendation</label>
              <div className="p-3 bg-[#0a0f1d] border border-[#1e293b] rounded-lg font-mono text-xs text-slate-300 leading-relaxed">
                {simulatedAiResult.reason}
              </div>
            </div>

            {/* 4. Reliability & Guardrails */}
            <div className="p-3 bg-[#0a0f1d] border border-[#1e293b] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Reliability</span>
                <span className="font-mono text-indigo-400 font-bold">{simulatedAiResult.reliabilityScore ?? simulatedAiResult.confidenceScore}%</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#1e293b]/60">
                <span className="text-slate-400">Safety Guardrails</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Developers always remain in control</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Risk Simulator */}
        <Card
          title="Risk Simulator"
          subtitle="Preview how performance metric variations impact rollout safety recommendations"
          action={
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleSimulateAi}
            >
              Analyze Risk
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Error Rate (%)</span>
                <span className="font-mono text-rose-400">{simulatedMetrics.error_rate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.1"
                value={simulatedMetrics.error_rate}
                onChange={(e) => {
                  setSimulatedMetrics({ ...simulatedMetrics, error_rate: Number(e.target.value) });
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0% (Healthy)</span>
                <span>1% Normal</span>
                <span>5% Critical</span>
                <span>12% Severe</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Response Time (ms)</span>
                <span className="font-mono text-indigo-400">{simulatedMetrics.response_time} ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="900"
                step="25"
                value={simulatedMetrics.response_time}
                onChange={(e) => {
                  setSimulatedMetrics({ ...simulatedMetrics, response_time: Number(e.target.value) });
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>50ms</span>
                <span>250ms Target</span>
                <span>500ms Warning</span>
                <span>900ms Critical</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Failed Requests</span>
                <span className="font-mono text-amber-400">{simulatedMetrics.api_failures} fails</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={simulatedMetrics.api_failures}
                onChange={(e) => {
                  setSimulatedMetrics({ ...simulatedMetrics, api_failures: Number(e.target.value) });
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleSimulateAi}
              icon={Sparkles}
            >
              Analyze Risk
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
