import React from 'react';
import { Region } from '../types';

interface RegionSelectorProps {
  selectedRegion: Region | null;
  onSelect: (region: Region) => void;
  disabled: boolean;
}

const regionFlags: Record<Region, string> = {
  [Region.WORLD]: '🌍',
  [Region.EUROPE]: '🏰',
  [Region.GERMANY]: '🥨',
  [Region.ITALY]: '🍕',
  [Region.SPAIN]: '💃',
  [Region.SWITZERLAND]: '🏔️',
  [Region.USA]: '🗽',
  [Region.ASIA]: '🏮',
  [Region.UK]: '☕',
  [Region.BADEN_WUERTTEMBERG]: '🍷',
  [Region.BAYERN]: '🍺',
  [Region.LOMBARDIA]: '🏛️',
};

export const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onSelect, disabled }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-fit mx-auto px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Regions
        </p>
        <div className="flex gap-5 overflow-x-auto pt-2 pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {Object.values(Region).map((region) => {
            const isSelected = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => onSelect(region)}
                disabled={disabled}
                className={`flex flex-col items-center gap-2 ml-2 flex-shrink-0 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Circular Avatar */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-200 dark:ring-blue-900 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}>
                  {regionFlags[region]}
                </div>
                {/* Label */}
                <span className={`
                  text-xs font-medium max-w-[70px] truncate transition-colors duration-200
                  ${isSelected 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400'
                  }
                `}>
                  {region}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};