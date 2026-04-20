import React, { useEffect, useRef } from 'react';

/**
 * BarcodeListener — silently intercepts USB barcode scanner input.
 * USB scanners type all characters very fast (within ~80ms) then send Enter.
 * We differentiate this from human typing by measuring the speed of keystrokes.
 */
const BarcodeListener = ({ onScan }) => {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is actively typing in a form input (but allow if it's the hidden buffer)
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isFormInput = (tag === 'input' || tag === 'textarea' || tag === 'select') 
        && document.activeElement?.dataset?.barcodeTarget !== 'true';

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const scanned = bufferRef.current.trim();
        bufferRef.current = '';
        if (scanned.length >= 2) {
          // Only fire if we got characters fast enough (scanner-like speed)
          onScan(scanned);
        }
        return;
      }

      // If time since last key is too long, it's a human — reset buffer
      if (timeSinceLast > 80 && bufferRef.current.length > 0) {
        // Only reset if it wasn't a form input sending chars
        if (!isFormInput) {
          bufferRef.current = '';
        }
      }

      // Accumulate if not in a form field (barcode scanner fires outside inputs)
      if (!isFormInput && e.key.length === 1) {
        bufferRef.current += e.key;

        // Safety: clear buffer after 3 seconds of inactivity
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          bufferRef.current = '';
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [onScan]);

  return (
    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Scanner Ready
    </div>
  );
};

export default BarcodeListener;
