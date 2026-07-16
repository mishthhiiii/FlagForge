import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 outline-none select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/10',
    secondary: 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-500/10',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/10',
    ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
    icon: 'p-2 h-10 w-10 text-sm gap-0',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...(props as any)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </motion.button>
  );
};
export default Button;
