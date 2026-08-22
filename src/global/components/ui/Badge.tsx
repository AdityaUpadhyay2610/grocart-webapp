import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'red' | 'indigo' | 'orange' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className = '' }) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    orange: 'bg-orange-100 text-orange-800',
    slate: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
