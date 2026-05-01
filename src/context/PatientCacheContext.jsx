import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { APPS_SCRIPT_URL, API_KEY } from '../config';

const PatientCacheContext = createContext();

export const usePatientCache = () => useContext(PatientCacheContext);

const processPatients = (patients) => {
  return patients.map(p => ({
    ...p,
    fullName: p.fullName || `${p.firstName || ''} ${p.surname || ''}${p.suffix ? ' ' + p.suffix : ''}`.trim() || 'Unknown Name'
  }));
};

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
      if (storedPatients) setPatients(processPatients(JSON.parse(storedPatients)));
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
      const response = await axios.get(`${APPS_SCRIPT_URL}?apiKey=${API_KEY}`);
      if (response.data.success) {
        const newPatients = processPatients(response.data.data.patients || []);
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
  
  const updatePatientInCache = useCallback((updatedPatient) => {
    setPatients(prev => {
      const processed = processPatients([updatedPatient])[0];
      const next = prev.map(p => p.id === updatedPatient.id ? { ...p, ...processed } : p);
      localStorage.setItem('patientCache_patients', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateHistoryInCache = useCallback((newLog) => {
    setHistory(prev => {
      const next = [newLog, ...prev];
      localStorage.setItem('patientCache_history', JSON.stringify(next));
      return next;
    });
  }, []);

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
      updatePatientInCache,
      updateHistoryInCache,
      findPatientById,
      getPatientHistory
    }}>
      {children}
    </PatientCacheContext.Provider>
  );
};
