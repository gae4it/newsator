import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Region,
  NewsCategory,
  NewsTopic,
  ViewMode,
  AIModel,
  Language,
  AppMode,
  PromptType,
  Newspaper,
  RSSHeadline,
} from './types';
import { fetchNewsSummary } from './services/geminiService';
import { fetchRSSHeadlines } from './services/rssService';
import { RegionSelector } from './components/RegionSelector';
import { CategorySelector } from './components/CategorySelector';
import { NewsCardFeed } from './components/NewsCardFeed';
import { NewsHeadlineRow } from './components/NewsHeadlineRow';
import { ModeSelector } from './components/ModeSelector';
import { ModelSelector } from './components/ModelSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { PWAInstallButton } from './components/PWAInstallButton';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { OverviewSkeleton } from './components/OverviewSkeleton';
import { ThemeToggle } from './components/ThemeToggle';
import { ProgressBar } from './components/ProgressBar';
import { PromptCopyButton } from './components/PromptCopyButton';
import { AppModeSelector } from './components/AppModeSelector';
import { PromptTypeSelector } from './components/PromptTypeSelector';
import { NewspaperSelector } from './components/NewspaperSelector';
import { RSSHeadlinesList } from './components/RSSHeadlinesList';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { NEWSPAPERS } from './newspapers';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.WORLD); // Default to World
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SUMMARY);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.GEMINI_2_0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || Language.EN;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.RSS);
  const [selectedPromptType, setSelectedPromptType] = useState<PromptType>(PromptType.EXTENDED);

  // References for scrolling
  const headlinesRef = useRef<HTMLDivElement>(null);

  // RSS Mode state
  const [selectedNewspaper, setSelectedNewspaper] = useState<Newspaper | null>(null);
  const [rssHeadlines, setRssHeadlines] = useState<RSSHeadline[]>([]);
  const [isLoadingRSS, setIsLoadingRSS] = useState<boolean>(false);
  const [rssError, setRssError] = useState<string | null>(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent automatic prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
  }, [deferredPrompt]);

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

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('language', selectedLanguage);
  }, [selectedLanguage]);

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

  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const handleRegionSelect = useCallback((region: Region) => {
    setSelectedRegion(region);
    setSelectedCategory(null);
    setCurrentNews(null);
    setError(null);
  }, []);

  const handleCategorySelect = useCallback(
    async (category: NewsCategory) => {
      if (category === selectedCategory && currentNews) return;

      setSelectedCategory(category);

      // Only fetch news if in READ mode
      if (appMode !== AppMode.READ) {
        setCurrentNews(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentNews(null);

      try {
        const data = await fetchNewsSummary(
          selectedRegion,
          category,
          viewMode,
          selectedModel,
          [],
          selectedLanguage
        );
        setCurrentNews(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRegion, selectedCategory, viewMode, selectedModel, selectedLanguage, appMode]
  );

  const handleLoadMore = useCallback(async () => {
    if (!selectedCategory || !currentNews || isLoading || isLoadingMore) return;

    const limit = viewMode === ViewMode.OVERVIEW ? 50 : 10;
    if (currentNews.points.length >= limit) return;

    setIsLoadingMore(true);
    setError(null);

    const excludeTitles = currentNews.points.map((p) => p.title);

    try {
      const data = await fetchNewsSummary(
        selectedRegion,
        selectedCategory,
        viewMode,
        selectedModel,
        excludeTitles,
        selectedLanguage
      );

      const updatedPoints = [...currentNews.points, ...data.points];
      setCurrentNews({
        ...currentNews,
        points: updatedPoints,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more news.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [selectedRegion, selectedCategory, viewMode, selectedModel, selectedLanguage]);

  const handleModeChange = useCallback(
    async (mode: ViewMode) => {
      setViewMode(mode);
      if (!selectedCategory) return;

      setIsLoading(true);
      setError(null);
      setCurrentNews(null);

      try {
        const data = await fetchNewsSummary(
          selectedRegion,
          selectedCategory,
          mode,
          selectedModel,
          [],
          selectedLanguage
        );
        setCurrentNews(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRegion, selectedCategory, selectedModel, selectedLanguage]
  );

  const handleModelChange = useCallback(
    async (model: AIModel) => {
      setSelectedModel(model);
      if (!selectedCategory) return;

      setIsLoading(true);
      setError(null);
      setCurrentNews(null);

      try {
        const data = await fetchNewsSummary(
          selectedRegion,
          selectedCategory,
          viewMode,
          model,
          [],
          selectedLanguage
        );
        setCurrentNews(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRegion, selectedCategory, viewMode, selectedLanguage]
  );

  const handleRefresh = useCallback(async () => {
    if (!selectedCategory || isLoading) return;

    setIsLoadingRSS(true);
    setRssError(null);

    try {
      const data = await fetchNewsSummary(
        selectedRegion,
        selectedCategory,
        viewMode,
        selectedModel,
        [],
        selectedLanguage
      );
      setCurrentNews(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoadingRSS(false);
    }
  }, [selectedRegion, selectedCategory, viewMode, selectedModel, selectedLanguage]);

  const handleRSSFetch = useCallback(async (newspaper: Newspaper) => {
    setSelectedNewspaper(newspaper);
    setIsLoadingRSS(true);
    setRssHeadlines([]);
    setRssError(null);

    // Scroll to headlines container
    setTimeout(() => {
      headlinesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      if (newspaper.rssUrl) {
        const headlines = await fetchRSSHeadlines(
          newspaper.rssUrl,
          newspaper.fetchingMethod,
          newspaper.selectors
        );
        setRssHeadlines(headlines);
      } else {
        setRssError('No RSS feed available for this newspaper');
      }
    } catch (err) {
      console.error('Failed to fetch RSS:', err);
      setRssError(err instanceof Error ? err.message : 'Failed to fetch headlines');
    } finally {
      setIsLoadingRSS(false);
    }
  }, []);

  // Handle language change auto-refresh
  useEffect(() => {
    if (selectedCategory) {
      handleRefresh();
    }
  }, [selectedLanguage, handleRefresh, selectedCategory]); // Only trigger when language changes

  const formatTimestamp = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <a
              href="https://newsator.netlify.app/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="Newsator Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  <span className="text-blue-600 dark:text-blue-400">News</span>ator AI
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                  Fast & Free News
                </p>
              </div>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <PWAInstallButton deferredPrompt={deferredPrompt} onInstall={handleInstallClick} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <LanguageSelector
              currentLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      {/* App Mode Selector */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex justify-center">
          <AppModeSelector
            selectedMode={appMode}
            onSelect={setAppMode}
            disabled={isLoading || isLoadingRSS}
          />
        </div>
      </div>

      {/* RSS Mode: Newspaper Selector */}
      {appMode === AppMode.RSS && (
        <NewspaperSelector
          newspapers={NEWSPAPERS}
          selectedNewspaper={selectedNewspaper}
          onSelect={handleRSSFetch}
          disabled={isLoadingRSS}
        />
      )}

      {/* Read/Prompt Mode: Region Selector - Circular Avatars */}
      {appMode !== AppMode.RSS && (
        <>
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
        </>
      )}

      {/* Selectors Bar - Conditional based on mode */}
      {appMode === AppMode.READ && (
        <div className="flex flex-col items-center justify-center gap-4 my-6 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <ModeSelector
              selectedMode={viewMode}
              onSelect={handleModeChange}
              disabled={isLoading}
            />
            <ModelSelector
              selectedModel={selectedModel}
              onSelect={handleModelChange}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {appMode === AppMode.PROMPT && selectedCategory && (
        <div className="flex flex-col items-center justify-center gap-4 my-6 px-4">
          <div className="w-full">
            <PromptTypeSelector
              selectedType={selectedPromptType}
              onSelect={setSelectedPromptType}
            />
          </div>
        </div>
      )}

      <ProgressBar isLoading={isLoading} />

      <main className="max-w-4xl mx-auto px-2 py-6">
        {/* RSS Mode Components */}
        {appMode === AppMode.RSS && (
          <div ref={headlinesRef}>
            {!selectedNewspaper && !isLoadingRSS && (
              <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="inline-block p-6 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                  <span className="text-4xl">📡</span>
                </div>
                <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
                  Select a newspaper
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Choose from the newspapers above to view headlines
                </p>
              </div>
            )}

            {/* Error State */}
            {rssError && selectedNewspaper && (
              <div className="flex items-center justify-center py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl max-w-lg w-full border border-red-100 dark:border-red-900 shadow-sm">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚠️</span> Unable to fetch headlines
                  </p>
                  <p className="text-sm mb-4 opacity-90 leading-relaxed">{rssError}</p>
                  <button
                    onClick={() => selectedNewspaper && handleRSSFetch(selectedNewspaper)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {selectedNewspaper && !rssError && (
              <RSSHeadlinesList
                headlines={rssHeadlines}
                newspaperName={selectedNewspaper.name}
                flag={selectedNewspaper.flag}
                description={selectedNewspaper.description}
                isLoading={isLoadingRSS}
              />
            )}
          </div>
        )}

        {/* Prompt Mode Components */}
        {appMode === AppMode.PROMPT && selectedCategory && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PromptCopyButton
              region={selectedRegion}
              category={selectedCategory}
              language={selectedLanguage}
              promptType={selectedPromptType}
            />
          </div>
        )}

        {/* Read Mode Components */}
        {appMode === AppMode.READ && (
          <>
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
                {viewMode === ViewMode.SUMMARY ? (
                  <>
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                  </>
                ) : (
                  <OverviewSkeleton />
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl max-w-lg w-full border border-red-100 dark:border-red-900 shadow-sm overflow-hidden break-words">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚠️</span> Unable to fetch news
                  </p>
                  <p className="text-sm mb-4 opacity-90 leading-relaxed break-words">{error}</p>
                  <button
                    onClick={() => selectedCategory && handleCategorySelect(selectedCategory)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* News Feed - Display all news points as individual cards or rows */}
            {currentNews && !isLoading && selectedCategory && (
              <>
                {/* Header with timestamp and refresh button */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>📰</span>
                    <span>
                      {lastUpdated && (
                        <>
                          Updated {formatTimestamp(lastUpdated)}
                          <span className="ml-2 text-xs opacity-60">(cached for 30 min)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh news"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>

                {viewMode === ViewMode.SUMMARY ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentNews.points.map((point, index) => (
                      <NewsCardFeed key={index} newsPoint={point} category={selectedCategory} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {currentNews.points.map((point, index) => (
                      <NewsHeadlineRow key={index} newsPoint={point} category={selectedCategory} />
                    ))}
                  </div>
                )}

                {/* Load More Button - Centered below news content */}
                {currentNews.points.length < (viewMode === ViewMode.OVERVIEW ? 50 : 10) && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold rounded-xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          Searching more news...
                        </>
                      ) : (
                        <>
                          <span>➕</span> Load More{' '}
                          {viewMode === ViewMode.OVERVIEW ? 'Headlines' : 'Cards'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 mt-12 text-center transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-xs">
            <a
              href="/download.html"
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Download App
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
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
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
            Educational Project • No Cookies • No Tracking
          </p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default App;
