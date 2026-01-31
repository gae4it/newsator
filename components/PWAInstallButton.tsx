import React from 'react';

interface PWAInstallButtonProps {
  deferredPrompt: any;
  onInstall: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  deferredPrompt,
  onInstall,
}) => {
  // If no prompt event is available, don't show the button
  // (Note: Browsers like Chrome on Desktop or Android fire this)
  if (!deferredPrompt) return null;

  return (
    <button
      onClick={onInstall}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center w-[36px] h-[36px]"
      title="Install App"
      aria-label="Install Newsator AI as Web App"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    </button>
  );
};
