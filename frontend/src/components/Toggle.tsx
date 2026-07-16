import React from 'react';
import { motion } from 'motion/react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  id,
}) => {
  const sizes = {
    sm: { width: 'w-8', height: 'h-5', thumb: 'h-3.5 w-3.5', translate: 12 },
    md: { width: 'w-11', height: 'h-6', thumb: 'h-4.5 w-4.5', translate: 20 },
    lg: { width: 'w-14', height: 'h-8', thumb: 'h-6 w-6', translate: 24 },
  };

  const currentSize = sizes[size] || sizes.md;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      id={id}
      onClick={handleToggle}
      className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none select-none ${
        currentSize.width
      } ${currentSize.height} ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${checked ? 'bg-emerald-500' : 'bg-zinc-800'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 left-0.5 rounded-full bg-white shadow-md ${
          currentSize.thumb
        }`}
        animate={{
          x: checked ? currentSize.translate : 0,
        }}
      />
    </div>
  );
};
export default Toggle;
