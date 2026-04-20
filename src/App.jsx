import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import EventDetails from './pages/EventDetails';
import { AppModeProvider } from './context/AppModeContext';
import { PatientCacheProvider } from './context/PatientCacheContext';
import ModeToggle from './components/ModeToggle';

function App() {
  return (
    <AppModeProvider>
      <PatientCacheProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/:category" element={<PatientList />} />
          <Route path="/admin/:category/:patientId" element={<PatientDetails />} />
          <Route path="/admin/:category/:patientId/event/:eventId" element={<EventDetails />} />
        </Routes>
        <ModeToggle />
      </Router>
      </PatientCacheProvider>
    </AppModeProvider>
  );
}

export default App;
