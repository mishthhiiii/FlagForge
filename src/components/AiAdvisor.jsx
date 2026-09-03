import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Sparkles, Bot, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function AiAdvisor() {
  const { flags, currentEnv, aiRecommendation, isAiLoading, generateAiRecommendation } = useApp();
  const [selectedFlagKey, setSelectedFlagKey] = useState(flags[0]?.flag_key || 'ab-test-hero-cta-button');

  const handleAnalyze = () => {
    generateAiRecommendation(selectedFlagKey);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Gemini AI Rollout Recommendation Engine</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Predictive rollout risk analysis powered by Google Gemini AI and real-time telemetry metrics
        </p>
      </div>

      {/* Selector Box */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4 shadow-sm">
        <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider">
          Select Feature Flag to Evaluate:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedFlagKey}
            onChange={(e) => setSelectedFlagKey(e.target.value)}
            className="w-full sm:flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            {flags.map((f) => (
              <option key={f.id} value={f.flag_key} className="bg-[#0f172a]">
                {f.name} ({f.flag_key})
              </option>
            ))}
          </select>

          <button
            onClick={handleAnalyze}
            disabled={isAiLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing Telemetry...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Run Gemini AI Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommendation Results Output */}
      {aiRecommendation ? (
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#3730a3] rounded-xl p-6 space-y-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#3730a3] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#6366f1] text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gemini Assessment for {selectedFlagKey}</h3>
                <p className="text-[11px] text-[#c7d2fe]">Target Environment: {currentEnv}</p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Confidence: {aiRecommendation.confidence_score}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-lg">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Assessed Risk Level</span>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-lg font-extrabold ${
                  aiRecommendation.risk_level === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {aiRecommendation.risk_level} RISK
                </span>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-lg">
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Suggested Rollout Percentage</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-extrabold text-indigo-400">
                  {aiRecommendation.suggested_rollout}%
                </span>
                <span className="text-xs text-[#94a3b8]">recommended weight</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-lg space-y-2">
            <span className="text-[10px] font-bold text-[#64748b] uppercase">AI Rationale & Deployment Strategy</span>
            <p className="text-xs text-[#f8fafc] leading-relaxed">
              {aiRecommendation.rationale}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-12 text-center text-[#94a3b8]">
          <Bot className="w-10 h-10 mx-auto text-[#64748b] mb-3" />
          <p className="text-xs">Click "Run Gemini AI Assessment" above to fetch automated rollout recommendations.</p>
        </div>
      )}
    </div>
  );
}
