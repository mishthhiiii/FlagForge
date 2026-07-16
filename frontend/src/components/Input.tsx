import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-500 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-zinc-900 border ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-indigo-500'
            } text-zinc-200 rounded-md text-sm px-3.5 py-2 outline-none transition-all duration-150 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-zinc-500 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-zinc-500 leading-normal">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-zinc-900 border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-indigo-500'
          } text-zinc-200 rounded-md text-sm px-3.5 py-2.5 outline-none transition-all duration-150 min-h-[100px] resize-y ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-zinc-500 leading-normal">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
