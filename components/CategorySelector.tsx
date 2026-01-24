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
  [NewsCategory.CRIME]: '🚔',
  [NewsCategory.BUSINESS]: '📈',
  [NewsCategory.TECHNOLOGY]: '💻',
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
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-4xl md:max-w-5xl mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {Object.values(NewsCategory).map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelect(category)}
                disabled={disabled}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 whitespace-nowrap
                  ${isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span>{categoryIcons[category]}</span>
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
