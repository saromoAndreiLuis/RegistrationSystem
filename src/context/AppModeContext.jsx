import React, { createContext, useState, useEffect, useContext } from 'react';

const AppModeContext = createContext();

export const AppModeProvider = ({ children }) => {
  // Check local storage for saved mode, default to 'radiant'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('appMode');
    return savedMode ? savedMode : 'radiant';
  });

  useEffect(() => {
    localStorage.setItem('appMode', mode);
    // Add class to body for global CSS if needed
    if (mode === 'lite') {
      document.body.classList.add('lite-mode');
      document.body.classList.remove('radiant-mode');
    } else {
      document.body.classList.add('radiant-mode');
      document.body.classList.remove('lite-mode');
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'radiant' ? 'lite' : 'radiant'));
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => useContext(AppModeContext);
