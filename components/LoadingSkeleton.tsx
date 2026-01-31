import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl h-80 border border-slate-200 dark:border-slate-700 p-4 transition-colors duration-300"
        >
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-full"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-5/6"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4 mt-2"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-full mt-4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-4/5"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
