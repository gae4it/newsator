import React from 'react';
import { NewsPoint, NewsCategory } from '../types';

interface NewsCardFeedProps {
  newsPoint: NewsPoint;
  category: NewsCategory;
}

// Category header gradients
const categoryHeaders: Record<NewsCategory, string> = {
  [NewsCategory.BREAKING]: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)', // Red to Orange
  [NewsCategory.POLITICS]: 'linear-gradient(135deg, #1e40af 0%, #6366f1 100%)', // Blue to Indigo
  [NewsCategory.ECONOMY]: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)', // Gold to Yellow
  [NewsCategory.BUSINESS]: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', // Indigo gradient
  [NewsCategory.TECHNOLOGY]: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', // Cyan gradient
  [NewsCategory.CRIME]: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', // Dark gray
  [NewsCategory.WORLD]: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', // Purple gradient
  [NewsCategory.CLIMATE]: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Green gradient
  [NewsCategory.HEALTH]: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', // Teal gradient
  [NewsCategory.CULTURE]: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', // Pink gradient
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

// Category to image mapping
const categoryImages: Record<NewsCategory, string> = {
  [NewsCategory.BREAKING]: 'breaking-news.png',
  [NewsCategory.POLITICS]: 'politics.png',
  [NewsCategory.ECONOMY]: 'economy.png',
  [NewsCategory.BUSINESS]: 'business.png',
  [NewsCategory.TECHNOLOGY]: 'technology.png',
  [NewsCategory.CRIME]: 'crime.png',
  [NewsCategory.WORLD]: 'world.png',
  [NewsCategory.CLIMATE]: 'climate.png',
  [NewsCategory.HEALTH]: 'health.png',
  [NewsCategory.CULTURE]: 'culture.png',
};

export const NewsCardFeed: React.FC<NewsCardFeedProps> = ({ newsPoint, category }) => {
  const headerGradient = categoryHeaders[category];
  const imageName = categoryImages[category];
  
  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Category Header Image with Gradient Fallback */}
      <div className="h-32 relative overflow-hidden bg-slate-200 dark:bg-slate-700">
        {/* Gradient Fallback */}
        <div 
          className="absolute inset-0 w-full h-full opacity-50"
          style={{ background: headerGradient }}
        />
        
        {/* Category Image */}
        <img 
          src={`/images/categories/${imageName}`}
          alt={category}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0';
          }}
        />

        {/* Overlay for better text readability (if needed) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${categoryColors[category]}`}>
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
