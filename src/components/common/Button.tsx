import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg tracking-tight select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-sm',
    md: 'text-sm px-4 py-2 gap-2 shadow-sm',
    lg: 'text-base px-6 py-3 gap-2.5 shadow-md',
  };

  const variantStyles = {
    primary: 'bg-forest-900 text-cream-50 hover:bg-forest-800 focus:ring-forest-700 border border-forest-800',
    secondary: 'bg-cream-200 text-ink-900 hover:bg-cream-300 focus:ring-forest-600 border border-stone-200/60',
    outline: 'border border-forest-900/30 text-forest-900 hover:bg-forest-50 focus:ring-forest-600 bg-transparent',
    ghost: 'text-ink-700 hover:bg-cream-200/70 hover:text-ink-900 focus:ring-stone-400 bg-transparent shadow-none',
    danger: 'bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-500 border border-rose-800',
    lime: 'bg-lime-400 text-forest-950 font-semibold hover:bg-lime-300 focus:ring-lime-500 shadow-md border border-lime-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
