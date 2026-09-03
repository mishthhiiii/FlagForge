import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { FileText, User, Clock, Activity } from 'lucide-react';

export default function AuditLogsList() {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs & Governance</h1>
        <p className="text-xs text-gray-400 mt-1">
          Historical record of feature flag state modifications, rollout weight updates, and system admin actions
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1e293b] bg-[#1e293b]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-[#f8fafc] uppercase tracking-wider">Activity History</span>
          </div>
          <span className="text-xs text-[#94a3b8]">{auditLogs.length} Records</span>
        </div>

        <div className="divide-y divide-[#1e293b]">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94a3b8]">No audit logs recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1e293b]/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f8fafc]">{log.action}</span>
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">{log.details}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#64748b]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>{log.user_name || log.user_email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
