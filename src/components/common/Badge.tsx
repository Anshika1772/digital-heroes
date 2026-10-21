import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'lime' | 'gold' | 'stone' | 'rose' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = '',
  icon
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  const variantStyles = {
    forest: 'bg-forest-900/10 text-forest-900 border border-forest-900/20',
    lime: 'bg-lime-400/25 text-forest-950 border border-lime-500/40 font-bold',
    gold: 'bg-amber-100 text-amber-900 border border-amber-300',
    stone: 'bg-stone-200/60 text-stone-700 border border-stone-300/60',
    rose: 'bg-rose-100 text-rose-800 border border-rose-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
