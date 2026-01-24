import React, { useRef, useState, useEffect } from 'react';
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
  [NewsCategory.SPORT]: '⚽',
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onSelect, 
  disabled 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 relative group">
      <div className="max-w-4xl md:max-w-5xl mx-auto px-4 relative flex items-center">
        
        {/* Left Arrow Button - Desktop Only */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hidden md:flex hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Categories Container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-3 scrollbar-hide scroll-smooth w-full" 
          style={{ scrollbarWidth: 'none' }}
        >
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
                    ? 'bg-blue-600 text-white shadow-md scale-105' 
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

        {/* Right Arrow Button - Desktop Only */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hidden md:flex hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
