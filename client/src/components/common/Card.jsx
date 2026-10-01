import React from 'react';

export const Card = ({ children, className = '', title, action, headerIcon: Icon }) => {
  return (
    <div className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">{title}</h3>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
