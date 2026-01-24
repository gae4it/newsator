import React from 'react';

export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="p-4 flex flex-col gap-2">
          {/* Title Placeholder */}
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
          
          {/* Source Placeholder */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
