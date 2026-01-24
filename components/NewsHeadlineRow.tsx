import React from 'react';
import { NewsPoint, NewsCategory } from '../types';

interface NewsHeadlineRowProps {
  newsPoint: NewsPoint;
  category: NewsCategory;
}

const categoryColors: Record<NewsCategory, string> = {
  [NewsCategory.BREAKING]: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  [NewsCategory.POLITICS]: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  [NewsCategory.ECONOMY]: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  [NewsCategory.BUSINESS]: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  [NewsCategory.TECHNOLOGY]: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20',
  [NewsCategory.CRIME]: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
  [NewsCategory.WORLD]: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  [NewsCategory.CLIMATE]: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  [NewsCategory.HEALTH]: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
  [NewsCategory.CULTURE]: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
};

export const NewsHeadlineRow: React.FC<NewsHeadlineRowProps> = ({ newsPoint, category }) => {
  return (
    <a 
      href={`https://www.google.com/search?q=${encodeURIComponent(newsPoint.summary)}`}
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
    >
      <div className={`shrink-0 w-2 h-2 rounded-full ${categoryColors[category].split(' ')[0]}`} />
      
      <div className="flex-grow min-w-0">
        <h4 className="text-[13px] md:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {newsPoint.summary}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${categoryColors[category]}`}>
            {newsPoint.sourceName}
          </span>
        </div>
      </div>

      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-slate-400 text-lg">🔍</span>
      </div>
    </a>
  );
};
