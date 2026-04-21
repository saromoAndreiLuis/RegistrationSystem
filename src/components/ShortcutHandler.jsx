import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useHotkeys from '../hooks/useHotkeys';
import { usePatientCache } from '../context/PatientCacheContext';

const ShortcutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCache } = usePatientCache();
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const keysConfig = {
    n: () => {
      navigate('/register');
      showToast('Alt + N: Registration Mode');
    },
    d: () => {
      navigate('/admin');
      showToast('Alt + D: Dashboard Mode');
    },
    r: () => {
      refreshCache();
      showToast('Alt + R: Data Refreshed');
    },
    f: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
        showToast('Alt + F: Search Focused');
      }
    }
  };

  useHotkeys(keysConfig);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono font-bold shadow-xl border border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
        {toast}
      </div>
    </div>
  );
};

export default ShortcutHandler;
