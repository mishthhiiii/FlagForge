import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Archived: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const currentStyle = styles[status] || styles.Draft;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase border ${currentStyle}`}>
      {status}
    </span>
  );
}

export function EnvironmentBadge({ env }) {
  const styles = {
    Development: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    Testing: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Staging: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Production: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  const currentStyle = styles[env] || styles.Development;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${currentStyle}`}>
      {env}
    </span>
  );
}

export function RecommendationBadge({ recommendation }) {
  const styles = {
    Continue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Pause: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Disable: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const currentStyle = styles[recommendation] || styles.Continue;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${currentStyle}`}>
      {recommendation}
    </span>
  );
}
