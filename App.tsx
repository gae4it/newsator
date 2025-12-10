import React, { useState, useCallback, useEffect } from 'react';
import { Region, NewsCategory, NewsTopic } from './types';
import { fetchNewsSummary } from './services/geminiService';
import { RegionSelector } from './components/RegionSelector';
import { CategorySelector } from './components/CategorySelector';
import { NewsCardFeed } from './components/NewsCardFeed';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.WORLD); // Default to World
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize Theme
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      localStorage.theme = 'light';
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRegionSelect = useCallback((region: Region) => {
    setSelectedRegion(region);
    // Clear category and news when switching regions
    setSelectedCategory(null);
    setCurrentNews(null);
    setError(null);
  }, []);

  const handleCategorySelect = useCallback(async (category: NewsCategory) => {
    // If same category is clicked, do nothing
    if (category === selectedCategory && currentNews) return;

    setSelectedCategory(category);
    setIsLoading(true);
    setError(null);
    setCurrentNews(null);

    try {
      const data = await fetchNewsSummary(selectedRegion, category);
      setCurrentNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion, selectedCategory, currentNews]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">News</span>ator AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time news powered by Gemini
            </p>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Region Selector - Circular Avatars */}
      <RegionSelector 
        selectedRegion={selectedRegion} 
        onSelect={handleRegionSelect} 
        disabled={isLoading}
      />

      {/* Category Selector - Horizontal Chips */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
        disabled={isLoading}
      />

      {/* Main Content - News Feed */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* No category selected */}
        {!selectedCategory && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <div className="inline-block p-6 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
              <span className="text-4xl">📰</span>
            </div>
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
              Select a category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Choose from the categories above to load more specific news.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-lg max-w-lg border border-red-100 dark:border-red-900">
              <p className="font-semibold mb-2">Unable to fetch news</p>
              <p className="text-sm mb-4">{error}</p>
              <button 
                onClick={() => selectedCategory && handleCategorySelect(selectedCategory)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* News Feed - Display all news points as individual cards */}
        {currentNews && !isLoading && selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentNews.points.map((point, index) => (
              <NewsCardFeed 
                key={index} 
                newsPoint={point} 
                category={selectedCategory}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 mt-12 text-center transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-center gap-4 text-xs">
            <a 
              href="/about.html" 
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a 
              href="/privacy.html" 
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a 
              href="/terms.html" 
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 mb-2">
            Powered by Google Gemini • News via Google Search Grounding
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
            Educational Project • No Cookies • No Tracking
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;