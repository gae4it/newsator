import React from 'react';
import { NewsCategory } from '../types';

interface CategorySelectorProps {
  selectedCategory: NewsCategory | null;
  onSelect: (category: NewsCategory) => void;
  disabled: boolean;
}

const categoryIcons: Record<NewsCategory, string> = {
  [NewsCategory.BREAKING]: '🚨',
  [NewsCategory.POLITICS]: '⚖️',
  [NewsCategory.ECONOMY]: '💰',
  [NewsCategory.BUSINESS]: '📈',
  [NewsCategory.TECHNOLOGY]: '💻',
  [NewsCategory.CRIME]: '🚔',
  [NewsCategory.WORLD]: '🌍',
  [NewsCategory.CLIMATE]: '🌱',
  [NewsCategory.HEALTH]: '🏥',
  [NewsCategory.CULTURE]: '🎨',
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onSelect, 
  disabled 
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-4 px-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg mb-6 transition-colors duration-300">
      {Object.values(NewsCategory).map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
              ${isSelected 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30 dark:shadow-blue-500/20 transform scale-105' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-102'}
            `}
          >
            <span>{categoryIcons[category]}</span>
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
};
