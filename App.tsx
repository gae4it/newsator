import React, { useState, useCallback, useEffect } from 'react';
import { Region, NewsResponse } from './types';
import { fetchNewsSummary } from './services/geminiService';
import { RegionSelector } from './components/RegionSelector';
import { NewsCard } from './components/NewsCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize Theme
  useEffect(() => {
    // Check local storage or system preference
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

  const handleRegionSelect = useCallback(async (region: Region) => {
    if (region === selectedRegion && newsData) return; // Avoid re-fetching active region if data exists

    setSelectedRegion(region);
    setIsLoading(true);
    setError(null);
    setNewsData(null);

    try {
      const data = await fetchNewsSummary(region);
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion, newsData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="pt-10 pb-4 relative">
          <div className="absolute right-0 top-10">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              <span className="text-blue-600 dark:text-blue-400">News</span>ator AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Real-time news summaries curated by Gemini, grounded in Google Search.
            </p>
          </div>
        </header>

        {/* Navigation */}
        <RegionSelector 
          selectedRegion={selectedRegion} 
          onSelect={handleRegionSelect} 
          disabled={isLoading}
        />

        {/* Content Area */}
        <main>
          {/* Initial State */}
          {!selectedRegion && !isLoading && (
            <div className="text-center py-20 opacity-60">
              <div className="inline-block p-6 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                <span className="text-4xl">🌍</span>
              </div>
              <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">Select a region to start</h2>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg inline-block max-w-lg border border-red-100 dark:border-red-900">
                <p className="font-semibold mb-2">Unable to fetch news</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={() => selectedRegion && handleRegionSelect(selectedRegion)}
                  className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Data Display */}
          {newsData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.topics.map((topic, idx) => (
                <NewsCard key={`${selectedRegion}-${idx}`} topic={topic} />
              ))}
            </div>
          )}
          
           {/* Empty Result State */}
           {newsData && newsData.topics.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400">No news found for this region at the moment.</p>
            </div>
          )}
        </main>

        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>Powered by Google Gemini & Vertex AI • News provided via Google Search Grounding</p>
        </footer>

      </div>
    </div>
  );
};

export default App;