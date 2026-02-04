import React from 'react';
import { AppMode } from '../types';

interface AppModeSelectorProps {
  selectedMode: AppMode;
  onSelect: (mode: AppMode) => void;
  disabled?: boolean;
}

export const AppModeSelector: React.FC<AppModeSelectorProps> = ({
  selectedMode,
  onSelect,
  disabled,
}) => {
  return (
    <div className="flex justify-center mb-0">
      <div className="bg-slate-200/50 dark:bg-slate-800/50 p-2 rounded-2xl flex gap-2 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
        <button
          onClick={() => onSelect(AppMode.RSS)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
            ${
              selectedMode === AppMode.RSS
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-105 z-10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer m-0.5'}
          `}
        >
          <span className="text-lg">📡</span>
          <span>RSS Mode</span>
        </button>
        <button
          onClick={() => onSelect(AppMode.PROMPT)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
            ${
              selectedMode === AppMode.PROMPT
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-105 z-10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer m-0.5'}
          `}
        >
          <span className="text-lg">✨</span>
          <span>Prompt Mode</span>
        </button>
        <button
          onClick={() => onSelect(AppMode.READ)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
            ${
              selectedMode === AppMode.READ
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-105 z-10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer m-0.5'}
          `}
        >
          <span className="text-lg">📖</span>
          <span>Read Mode</span>
        </button>
      </div>
    </div>
  );
};
