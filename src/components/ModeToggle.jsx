import React from 'react';
import { useAppMode } from '../context/AppModeContext';
import { Sparkles, Zap } from 'lucide-react';

const ModeToggle = () => {
  const { mode, toggleMode } = useAppMode();

  return (
    <button
      onClick={toggleMode}
      className={`fixed bottom-24 sm:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-headline font-semibold text-sm ${
        mode === 'radiant' 
          ? 'bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:shadow-[0_8px_30px_rgb(67,142,130,0.3)]' 
          : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
      }`}
      title={`Switch to ${mode === 'radiant' ? 'Lite' : 'Radiant'} Mode`}
    >
      {mode === 'radiant' ? (
        <>
          <Sparkles size={16} className="text-[var(--color-secondary)] animate-pulse" />
          <span>Radiant Mode</span>
        </>
      ) : (
        <>
          <Zap size={16} className="text-yellow-400" />
          <span>Lite Mode</span>
        </>
      )}
    </button>
  );
};

export default ModeToggle;
