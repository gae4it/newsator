import React from 'react';
import { ViewMode } from '../types';

interface ModeSelectorProps {
  selectedMode: ViewMode;
  onSelect: (mode: ViewMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelect, disabled }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl inline-flex gap-1 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onSelect(ViewMode.SUMMARY)}
          disabled={disabled}
          className={`
            px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${selectedMode === ViewMode.SUMMARY 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="flex items-center gap-2">
            <span>📝</span> Summary
          </span>
        </button>
        <button
          onClick={() => onSelect(ViewMode.OVERVIEW)}
          disabled={disabled}
          className={`
            px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${selectedMode === ViewMode.OVERVIEW 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="flex items-center gap-2">
            <span>⚡</span> Overview
          </span>
        </button>
      </div>
    </div>
  );
};
