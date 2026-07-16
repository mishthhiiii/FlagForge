import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverGlow = false,
  ...props
}) => {
  return (
    <div
      className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-200 ${
        hoverGlow ? 'hover:border-zinc-700/80 hover:shadow-xl hover:shadow-indigo-500/[0.01]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 border-b border-zinc-800 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-sm text-zinc-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-6 bg-zinc-900/30 border-t border-zinc-800 flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
