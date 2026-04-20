import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { APPS_SCRIPT_URL } from '../config';

const PatientCacheContext = createContext();

export const usePatientCache = () => useContext(PatientCacheContext);

export const PatientCacheProvider = ({ children }) => {
  const [patientCache, setPatientCache] = useState([]);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Load cache from localStorage immediately
  useEffect(() => {
    const stored = localStorage.getItem('patientCache');
    if (stored) {
      try {
        setPatientCache(JSON.parse(stored));
      } catch (_) {}
    }
    setCacheLoaded(true);
  }, []);

  // Refresh cache from network when online
  useEffect(() => {
    if (!navigator.onLine) return;

    const refresh = async () => {
      try {
        const response = await axios.get(APPS_SCRIPT_URL);
        if (response.data.success) {
          const patients = response.data.data.patients || [];
          localStorage.setItem('patientCache', JSON.stringify(patients));
          setPatientCache(patients);
        }
      } catch (_) {
        // Silently fail — we still have the localStorage cache
      }
    };

    refresh();

    const handleOnline = () => refresh();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Look up a patient by ID from the cache
  const findPatientById = (id) => {
    const cleaned = String(id).trim().replace(/^'+/, ''); // strip leading quotes
    return patientCache.find(
      p => String(p.id).trim().replace(/^'+/, '') === cleaned
    ) || null;
  };

  return (
    <PatientCacheContext.Provider value={{ patientCache, cacheLoaded, findPatientById }}>
      {children}
    </PatientCacheContext.Provider>
  );
};
