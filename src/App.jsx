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
import Navbar from './components/Navbar';
import ModeToggle from './components/ModeToggle';
import ShortcutHandler from './components/ShortcutHandler';
import FullscreenManager from './components/FullscreenManager';

function App() {
  return (
    <AppModeProvider>
      <PatientCacheProvider>
      <FullscreenManager>
        <Router>
          <Navbar />
          <ShortcutHandler />
          <div className="pb-20 sm:pb-0"> 
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/:category" element={<PatientList />} />
            <Route path="/admin/:category/:patientId" element={<PatientDetails />} />
            <Route path="/admin/:category/:patientId/event/:eventId" element={<EventDetails />} />
          </Routes>
        </div>
        <ModeToggle />
      </Router>
      </FullscreenManager>
      </PatientCacheProvider>
    </AppModeProvider>
  );
}

export default App;
