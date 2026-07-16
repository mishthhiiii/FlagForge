import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'secondary',
  dot = false,
  ...props
}) => {
  const styles = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    secondary: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  const dotColors = {
    primary: 'bg-indigo-400',
    secondary: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    purple: 'bg-violet-400',
  };

  const currentStyle = styles[variant] || styles.secondary;
  const currentDot = dotColors[variant] || dotColors.secondary;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none ${currentStyle} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${currentDot}`} />}
      {children}
    </span>
  );
};
export default Badge;
