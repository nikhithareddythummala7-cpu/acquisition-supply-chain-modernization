import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    info: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono tracking-tight ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
