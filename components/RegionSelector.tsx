import React from 'react';
import { Region } from '../types';

interface RegionSelectorProps {
  selectedRegion: Region | null;
  onSelect: (region: Region) => void;
  disabled: boolean;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-6 sticky top-0 bg-[#F8FAFC]/95 dark:bg-[#0F172A]/95 backdrop-blur-sm z-10 border-b border-slate-200/50 dark:border-slate-800/50 mb-8 transition-colors duration-300">
      {Object.values(Region).map((region) => {
        const isSelected = selectedRegion === region;
        return (
          <button
            key={region}
            onClick={() => onSelect(region)}
            disabled={disabled}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-500/20 transform scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {region}
          </button>
        );
      })}
    </div>
  );
};