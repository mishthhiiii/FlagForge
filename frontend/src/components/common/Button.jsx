import React from 'react';

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon = null,
  id = ''
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 active:scale-[0.98]',
    secondary: 'bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-[#334155] active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-[#334155]',
    danger: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 active:scale-[0.98]',
    subtle: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200'
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2'
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
