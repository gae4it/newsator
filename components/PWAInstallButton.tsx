import React from 'react';

interface PWAInstallButtonProps {
  deferredPrompt: any;
  onInstall: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ deferredPrompt, onInstall }) => {
  // If no prompt event is available, don't show the button
  // (Note: Browsers like Chrome on Desktop or Android fire this)
  if (!deferredPrompt) return null;

  return (
    <button
      onClick={onInstall}
      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center w-[36px] h-[36px]"
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
