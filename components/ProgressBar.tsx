import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      // Simulate progress: fast at first, then slows down
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 5; // Fast start
          if (prev < 70) return prev + 2; // Medium pace
          if (prev < 92) return prev + 0.5; // Slow down near end
          return prev; // Stay at 92 until complete
        });
      }, 100);
    } else {
      setProgress(100);
      // Briefly show 100% then hide by resetting after transition
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Hide the bar container if not loading and progress is 0
  if (!isLoading && progress === 0) return null;

  return (
    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
      <div
        className={`h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-300 ease-out`}
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-8 bg-white/30 blur-sm animate-pulse"
        style={{ left: `calc(${progress}% - 2rem)` }}
      />
    </div>
  );
};
