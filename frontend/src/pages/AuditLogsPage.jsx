import React, { useState, useEffect } from 'react';
import { Clock, User, ShieldCheck, Search, History, Flag } from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { apiGetAuditLogs } from '../services/api.js';

export function AuditLogsPage() {
  const { flags, auditLogs: contextLogs } = useFlags();
  const [logs, setLogs] = useState(contextLogs || []);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  // Fetch real audit logs automatically on page load
  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      setIsLoading(true);
      try {
        const response = await apiGetAuditLogs();
        if (isMounted && response.success && Array.isArray(response.data)) {
          setLogs(response.data);
        }
      } catch (err) {
        console.warn('[AuditLogsPage] Could not load live audit logs from backend:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to extract feature flag name and environment
  const getFlagDetails = (log) => {
    const matchedFlag = flags.find((f) => f.id === log.flag_id);
    const flagName = matchedFlag
      ? matchedFlag.name
      : log.flag_name || (log.flag_id ? `Flag #${log.flag_id}` : 'System');

    let environment = matchedFlag ? matchedFlag.environment : log.environment || null;

    if (!environment && log.action) {
      if (log.action.includes('Production')) environment = 'Production';
      else if (log.action.includes('Staging')) environment = 'Staging';
      else if (log.action.includes('Testing')) environment = 'Staging';
      else if (log.action.includes('Development')) environment = 'Development';
    }

    return { flagName, environment };
  };

  const filteredLogs = logs.filter((log) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const { flagName } = getFlagDetails(log);
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (flagName && flagName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Security & Rollout Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Immutable system logs recording all feature toggle adjustments, rollouts, and AI actions
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter logs by keyword or user..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Timestamp (UTC)</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Feature Flag</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Environment</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading audit log records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-300">No audit logs available</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {filterQuery ? 'No records match your search filter.' : 'System change events will appear here.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const { flagName, environment } = getFlagDetails(log);

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-slate-200">{log.user_name || 'System Operator'}</span>
                        </div>
                      </td>

                      {/* Feature Flag */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-indigo-300">
                          <Flag className="w-3 h-3 text-slate-500" />
                          <span>{flagName}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {log.action}
                      </td>

                      {/* Environment */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {environment ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                              environment === 'Production'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : (environment === 'Staging' || environment === 'Testing')
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {environment}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px] font-mono">—</span>
                        )}
                      </td>

                      {/* Verification */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Logged
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
