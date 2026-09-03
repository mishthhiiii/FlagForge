import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  TrendingUp, 
  Users, 
  Server, 
  Cpu, 
  Clock, 
  Activity, 
  Zap,
  BarChart,
  PieChart
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { flags, currentEnv } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Analytics & Telemetry</h1>
        <p className="text-xs text-gray-400 mt-1">
          Real-time performance metrics and SDK evaluation load across environments
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Latency SLA</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#f8fafc]">4.2 ms</div>
          <p className="text-xs text-emerald-400 mt-1">p99 edge evaluation speed</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Evaluation Throughput</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#f8fafc]">12,450 req/s</div>
          <p className="text-xs text-indigo-400 mt-1">+14% compared to yesterday</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Client SDKs</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#f8fafc]">1,820</div>
          <p className="text-xs text-purple-400 mt-1">Connected frontend clients</p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Flag Cache Hit Ratio</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#f8fafc]">99.94%</div>
          <p className="text-xs text-blue-400 mt-1">MySQL + Redis memory layer</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-indigo-400" />
            <span>Environment Request Volume</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Production</span>
                <span className="font-bold text-rose-400">1,240,000 reqs (62%)</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Staging</span>
                <span className="font-bold text-amber-400">480,000 reqs (24%)</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Development</span>
                <span className="font-bold text-emerald-400">280,000 reqs (14%)</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <span>Flag Variation Evaluation Status</span>
          </h2>

          <div className="space-y-3">
            {flags.map((flag) => {
              const envState = flag.environments[currentEnv] || { is_enabled: false, rollout_percentage: 0 };
              return (
                <div key={flag.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#1e293b]/50 border border-[#334155]/50">
                  <span className="font-mono text-[#818cf8]">{flag.flag_key}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      envState.is_enabled ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-[#334155] text-gray-400'
                    }`}>
                      {envState.is_enabled ? 'True' : 'False'}
                    </span>
                    <span className="text-[#f8fafc] font-bold">{envState.rollout_percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
