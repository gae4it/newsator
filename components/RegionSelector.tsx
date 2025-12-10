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
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen overflow-y-auto transition-colors duration-300">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-3">
        Regions
      </h2>
      {Object.values(Region).map((region) => {
        const isSelected = selectedRegion === region;
        return (
          <button
            key={region}
            onClick={() => onSelect(region)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 text-left
              ${isSelected 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-xl">{regionFlags[region]}</span>
            <span className="flex-1">{region}</span>
            {isSelected && (
              <span className="text-xs">▶</span>
            )}
          </button>
        );
      })}
    </div>
  );
};