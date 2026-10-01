import React from 'react';

export const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300 font-normal">
          {children}
        </tbody>
      </table>
    </div>
  );
};
