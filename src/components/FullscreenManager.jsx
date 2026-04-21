import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, ShieldAlert } from 'lucide-react';

const FullscreenManager = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [hasInteracted, setHasInteracted] = useState(false);

  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => {
        // Attempt to lock the Escape key (Chrome/Edge only)
        if (navigator.keyboard && navigator.keyboard.lock) {
          navigator.keyboard.lock(['Escape']).catch(err => {
            console.warn('Keyboard lock failed:', err);
          });
        }
      }).catch(err => {
        console.error(`Error entering fullscreen: ${err.message}`);
      });
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      
      // If we exit fullscreen, try to re-lock keyboard when we go back in
      if (!isFs && navigator.keyboard && navigator.keyboard.unlock) {
        navigator.keyboard.unlock();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    
    const handleKeyDown = (e) => {
      if (e.key === 'F11' || e.key === 'Escape') {
        if (!!document.fullscreenElement) {
          e.preventDefault();
          return false;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 z-[999] bg-gray-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Maximize size={40} className="text-[var(--color-primary)] animate-pulse" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-white mb-3">TGLFI Kiosk System</h2>
          <p className="text-gray-400 text-sm font-body mb-8">
            Please initialize the system to enter secure Fullscreen mode for registration.
          </p>
          <button
            onClick={() => {
              setHasInteracted(true);
              enterFullscreen();
            }}
            className="w-full py-4 px-8 bg-[var(--color-primary)] text-white font-headline font-bold rounded-2xl hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all shadow-xl shadow-[var(--color-primary)]/20"
          >
            Launch & Lock System
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {hasInteracted && !isFullscreen && (
        <div className="fixed inset-0 z-[1001] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} className="text-red-500 animate-bounce" />
            </div>
            <h2 className="text-xl font-headline font-bold text-white mb-2">SECURITY INTERRUPTED</h2>
            <p className="text-gray-400 text-sm mb-8">
              Kiosk mode has been breached. For security, all inputs are locked.
            </p>
            <button
              onClick={enterFullscreen}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              Resume Secure Session
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default FullscreenManager;
