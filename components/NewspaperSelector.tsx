import React from 'react';
import { Newspaper } from '../types';

interface NewspaperSelectorProps {
  newspapers: Newspaper[];
  selectedNewspaper: Newspaper | null;
  onSelect: (newspaper: Newspaper) => void;
  disabled: boolean;
}

export const NewspaperSelector: React.FC<NewspaperSelectorProps> = ({
  newspapers,
  selectedNewspaper,
  onSelect,
  disabled,
}) => {
  // Group newspapers by country
  const groupedNewspapers = newspapers.reduce(
    (acc, newspaper) => {
      if (!acc[newspaper.country]) {
        acc[newspaper.country] = [];
      }
      acc[newspaper.country].push(newspaper);
      return acc;
    },
    {} as Record<string, Newspaper[]>
  );

  const countryNames: Record<string, string> = {
    IT: 'Italy',
    DE: 'Germany',
    US: 'United States',
    EU: 'Europe',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Select Newspaper
        </p>

        {(Object.entries(groupedNewspapers) as [string, Newspaper[]][]).map(([country, papers]) => (
          <div key={country} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {countryNames[country] || country}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {papers.map((newspaper) => {
                const isSelected = selectedNewspaper?.id === newspaper.id;
                return (
                  <button
                    key={newspaper.id}
                    onClick={() => onSelect(newspaper)}
                    disabled={disabled}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300 dark:ring-blue-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    `}
                  >
                    <span className="text-lg">{newspaper.flag}</span>
                    <span className="truncate text-left flex-1">{newspaper.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
