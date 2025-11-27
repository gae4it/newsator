import React from 'react';
import { NewsTopic } from '../types';

interface NewsCardProps {
  topic: NewsTopic;
}

export const NewsCard: React.FC<NewsCardProps> = ({ topic }) => {
  const getIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('breaking')) return '🚨';
    if (lower.includes('politics')) return '⚖️';
    if (lower.includes('business')) return '📈';
    if (lower.includes('tech')) return '💻';
    if (lower.includes('sport')) return '⚽';
    if (lower.includes('culture')) return '🎨';
    return '📰';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md dark:hover:shadow-slate-700/30 transition-all duration-300 flex flex-col h-full">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <span className="text-xl">{getIcon(topic.category)}</span>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-sm">
          {topic.category}
        </h3>
      </div>
      <ul className="p-5 space-y-4 flex-grow">
        {topic.points.map((point, index) => (
          <li key={index} className="flex flex-col gap-1">
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {point.summary}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 dark:text-slate-500">Source:</span>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(point.summary)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline truncate max-w-[200px]"
              >
                {point.sourceName}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};