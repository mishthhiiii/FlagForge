import React from 'react';

export function Card({ children, className = '', title, subtitle, action, id = '' }) {
  return (
    <div
      id={id}
      className={`bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
