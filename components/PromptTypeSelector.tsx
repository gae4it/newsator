import React from 'react';
import { PromptType } from '../types';

interface PromptTypeSelectorProps {
  selectedType: PromptType;
  onSelect: (type: PromptType) => void;
}

export const PromptTypeSelector: React.FC<PromptTypeSelectorProps> = ({ 
  selectedType, 
  onSelect 
}) => {
  return (
    <div className="flex justify-center">
      <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 gap-2">
        <button
          onClick={() => onSelect(PromptType.EXTENDED)}
          className={`
            px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200
            ${selectedType === PromptType.EXTENDED 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          📝 Detailed Report
        </button>
        <button
          onClick={() => onSelect(PromptType.TITLES)}
          className={`
            px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200
            ${selectedType === PromptType.TITLES 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          ⚡ Headlines Only
        </button>
      </div>
    </div>
  );
};
