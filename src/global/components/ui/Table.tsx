import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <thead className={`bg-slate-50 border-b border-slate-200/80 ${className}`}>
    <tr>{children}</tr>
  </thead>
);

export const TableBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`}>
    {children}
  </tbody>
);

export const Th = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-4 whitespace-nowrap text-sm text-slate-700 ${className}`}>
    {children}
  </td>
);

export const Tr = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) => (
  <tr 
    onClick={onClick}
    className={`hover:bg-slate-50/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);
