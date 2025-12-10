import React from 'react';
import { NewsPoint, NewsCategory } from '../types';

interface NewsCardFeedProps {
  newsPoint: NewsPoint;
  category: NewsCategory;
}

// Category header images and gradients
const categoryHeaders: Record<NewsCategory, { type: 'image' | 'gradient'; value: string }> = {
  [NewsCategory.BREAKING]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/breaking_news_header_1765402089968.png' 
  },
  [NewsCategory.POLITICS]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/politics_header_1765402103997.png' 
  },
  [NewsCategory.ECONOMY]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/economy_header_1765402122554.png' 
  },
  [NewsCategory.BUSINESS]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/business_header_1765402177008.png' 
  },
  [NewsCategory.TECHNOLOGY]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/technology_header_1765402138943.png' 
  },
  [NewsCategory.CRIME]: { 
    type: 'gradient', 
    value: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
  },
  [NewsCategory.WORLD]: { 
    type: 'gradient', 
    value: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
  },
  [NewsCategory.CLIMATE]: { 
    type: 'gradient', 
    value: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
  },
  [NewsCategory.HEALTH]: { 
    type: 'image', 
    value: '/brain/fd7279ed-d60c-402b-8977-c9ffe2a25bcb/health_header_1765402152869.png' 
  },
  [NewsCategory.CULTURE]: { 
    type: 'gradient', 
    value: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' 
  },
};

const categoryColors: Record<NewsCategory, string> = {
  [NewsCategory.BREAKING]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [NewsCategory.POLITICS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [NewsCategory.ECONOMY]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [NewsCategory.BUSINESS]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  [NewsCategory.TECHNOLOGY]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  [NewsCategory.CRIME]: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  [NewsCategory.WORLD]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [NewsCategory.CLIMATE]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [NewsCategory.HEALTH]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  [NewsCategory.CULTURE]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export const NewsCardFeed: React.FC<NewsCardFeedProps> = ({ newsPoint, category }) => {
  const header = categoryHeaders[category];
  
  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Category Header Image */}
      <div className="h-32 relative overflow-hidden">
        {header.type === 'image' ? (
          <img 
            src={header.value} 
            alt={category}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ background: header.value }}
          />
        )}
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[category]}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-3">
          {newsPoint.summary}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(newsPoint.summary)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px]"
          >
            {newsPoint.sourceName}
          </a>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            📖
          </button>
        </div>
      </div>
    </article>
  );
};
