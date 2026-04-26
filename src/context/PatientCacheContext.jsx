import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { APPS_SCRIPT_URL } from '../config';

const PatientCacheContext = createContext();

export const usePatientCache = () => useContext(PatientCacheContext);

export const PatientCacheProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load initial data from localStorage
  useEffect(() => {
    const storedPatients = localStorage.getItem('patientCache_patients');
    const storedHistory = localStorage.getItem('patientCache_history');
    const storedTimestamp = localStorage.getItem('patientCache_timestamp');

    try {
      if (storedPatients) setPatients(JSON.parse(storedPatients));
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      if (storedTimestamp) setLastUpdated(new Date(storedTimestamp));
    } catch (e) {
      console.error('Failed to parse patient cache:', e);
      localStorage.removeItem('patientCache_patients');
      localStorage.removeItem('patientCache_history');
    }

    setCacheLoaded(true);
  }, []);

  const refreshCache = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(APPS_SCRIPT_URL);
      if (response.data.success) {
        const newPatients = response.data.data.patients || [];
        const newHistory = response.data.data.history || [];
        const now = new Date();

        setPatients(newPatients);
        setHistory(newHistory);
        setLastUpdated(now);

        localStorage.setItem('patientCache_patients', JSON.stringify(newPatients));
        localStorage.setItem('patientCache_history', JSON.stringify(newHistory));
        localStorage.setItem('patientCache_timestamp', now.toISOString());
      }
    } catch (error) {
      console.error('Cache refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh once on initial load if online
  useEffect(() => {
    if (navigator.onLine && !lastUpdated) {
      refreshCache();
    }
  }, [refreshCache, lastUpdated]);

  const findPatientById = (id) => {
    if (!id) return null;
    const numericId = parseInt(String(id).replace(/^'+/, ''), 10);
    return patients.find(p => parseInt(String(p.id).replace(/^'+/, ''), 10) === numericId) || null;
  };

  const getPatientHistory = (id) => {
    if (!id) return [];
    const numericId = parseInt(String(id).replace(/^'+/, ''), 10);
    return history.filter(h => parseInt(String(h.id || h.patientId).replace(/^'+/, ''), 10) === numericId);
  };

  return (
    <PatientCacheContext.Provider value={{
      patients,
      history,
      loading,
      cacheLoaded,
      lastUpdated,
      refreshCache,
      findPatientById,
      getPatientHistory
    }}>
      {children}
    </PatientCacheContext.Provider>
  );
};
