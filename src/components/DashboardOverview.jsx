import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  Layers, 
  Activity, 
  AlertTriangle, 
  GitBranch, 
  Plus, 
  Zap, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function DashboardOverview({ onOpenCreateFlag }) {
  const { flags, currentEnv, environments, setActiveTab, generateAiRecommendation } = useApp();

  const activeEnvObj = environments.find(e => e.env_key === currentEnv) || { name: 'Development' };

  // Calculate stats based on current env
  const totalFlags = flags.length;
  const activeInEnv = flags.filter(f => f.environments[currentEnv]?.is_enabled).length;
  const disabledInEnv = totalFlags - activeInEnv;
  const activeInProd = flags.filter(f => f.environments['production']?.is_enabled).length;

  return (
    <div className="space-y-6">
      {/* Overview Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 mt-1">
            Surgically control targeting parameters for <span className="text-indigo-400 font-semibold">{activeEnvObj.name}</span> environment
          </p>
        </div>
        <button
          onClick={onOpenCreateFlag}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Feature Flag</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-indigo-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Feature Flags</span>
            <div className="p-2 rounded-lg bg-[#1e293b] text-indigo-400 border border-[#334155]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#f8fafc]">{totalFlags}</span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">Defined configurations</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active in {activeEnvObj.name}</span>
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{activeInEnv}</span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">Serving target evaluations</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-amber-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disabled in {activeEnvObj.name}</span>
            <div className="p-2 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-800/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{disabledInEnv}</span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">Off variation fallback</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-rose-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active in Production</span>
            <div className="p-2 rounded-lg bg-rose-950/50 text-rose-400 border border-rose-800/50">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{activeInProd}</span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">Live in end-user accounts</p>
        </div>
      </div>

      {/* Analytics & Gemini Intelligence Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Frequency Chart Box */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs uppercase font-bold text-[#64748b] tracking-wider">Target Evaluation Frequency</h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Consolidated client SDK evaluations across routing layers (last 24 hours)
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-time
            </span>
          </div>

          {/* SVG Graph Simulation */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,100 Q 125,30 250,80 T 500,20 L 500,150 L 0,150 Z"
                fill="url(#gradient)"
              />
              <path
                d="M 0,100 Q 125,30 250,80 T 500,20"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-4 pt-3 border-t border-[#1e293b]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>Current</span>
          </div>
        </div>

        {/* Gemini AI Intelligence Widget */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#3730a3] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#818cf8] tracking-wider">Gemini Intelligence</span>
            <span className="text-[9px] font-extrabold bg-[#6366f1] text-white px-2 py-0.5 rounded uppercase">GEMINI AI</span>
          </div>

          <div className="my-4">
            <p className="italic text-[#c7d2fe] text-xs leading-relaxed">
              "Based on current latency metrics in <b className="text-white">Production</b>, <code className="bg-[#1e1b4b] text-[#818cf8] px-1 py-0.5 rounded">ai-code-generation-v2</code> rollout can safely be increased to <b className="text-emerald-400">75%</b> without impacting P99 latency."
            </p>
          </div>

          <button
            onClick={() => {
              generateAiRecommendation('ai-code-generation-v2');
              setActiveTab('ai-advisor');
            }}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply AI Recommendation</span>
          </button>
        </div>
      </div>

      {/* Quick Access Active Flags List */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Active Feature Flags ({activeEnvObj.name})</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Surgically toggle feature state or adjust rollout percentages</p>
          </div>
          <button
            onClick={() => setActiveTab('flags')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>View All Flags</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#1e293b]">
          {flags.slice(0, 4).map((flag) => {
            const envState = flag.environments[currentEnv] || { is_enabled: false, rollout_percentage: 0 };
            return (
              <div key={flag.id} className="p-4 flex items-center justify-between hover:bg-[#1e293b]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    envState.is_enabled 
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-rose-950/60 border-rose-800 text-rose-400'
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{flag.name}</h3>
                    <p className="font-mono text-[11px] text-[#818cf8] bg-[#1e1b4b] px-1.5 py-0.5 rounded inline-block mt-0.5">{flag.flag_key}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Rollout badge */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#f8fafc]">{envState.rollout_percentage}%</span>
                    <div className="w-20 h-1.5 bg-[#1e293b] rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${envState.rollout_percentage}%` }}></div>
                    </div>
                  </div>

                  {/* AI Advice Quick Button */}
                  <button
                    onClick={() => {
                      generateAiRecommendation(flag.flag_key);
                      setActiveTab('ai-advisor');
                    }}
                    className="p-1.5 text-indigo-300 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-xs flex items-center gap-1 transition-colors"
                    title="Get AI Rollout Recommendation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">AI Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
