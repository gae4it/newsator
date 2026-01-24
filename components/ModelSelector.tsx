import React from 'react';
import { AIModel } from '../types';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onSelect: (model: AIModel) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, disabled }) => {
  return (
    <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl inline-flex gap-1 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => onSelect(AIModel.GEMINI_1_5)}
        disabled={disabled}
        className={`
          px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
          ${selectedModel === AIModel.GEMINI_1_5 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        Gemini 1.5
      </button>
      <button
        onClick={() => onSelect(AIModel.GEMINI_2_0)}
        disabled={disabled}
        className={`
          px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
          ${selectedModel === AIModel.GEMINI_2_0 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        Gemini 2.0
      </button>
    </div>
  );
};
