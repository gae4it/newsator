import React from 'react';
import { RSSHeadline } from '../types';

interface RSSHeadlinesListProps {
  headlines: RSSHeadline[];
  newspaperName: string;
  isLoading: boolean;
}

export const RSSHeadlinesList: React.FC<RSSHeadlinesListProps> = ({
  headlines,
  newspaperName,
  isLoading,
}) => {
  const handleHeadlineClick = (title: string) => {
    const searchQuery = encodeURIComponent(title);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Loading headlines from {newspaperName}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (headlines.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 opacity-60">
              <div className="inline-block p-6 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                <span className="text-4xl">📰</span>
              </div>
              <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
                No headlines available
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Unable to fetch headlines from {newspaperName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>📰</span>
          <span>{newspaperName}</span>
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
            ({headlines.length} headlines)
          </span>
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {headlines.map((headline, index) => (
          <button
            key={index}
            onClick={() => handleHeadlineClick(headline.title)}
            className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 group"
          >
            <div className="flex items-start gap-3">
              <span className="text-slate-400 dark:text-slate-600 font-mono text-sm mt-0.5 flex-shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {headline.title}
              </p>
              <svg
                className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Click on any headline to search on Google
      </div>
    </div>
  );
};
