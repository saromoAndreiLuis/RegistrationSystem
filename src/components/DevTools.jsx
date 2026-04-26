import React, { useState, useEffect } from 'react';
import { Bug, Wifi, WifiOff } from 'lucide-react';
import { IS_DEV_MODE } from '../config';

const DevTools = () => {
  const [isForcedOffline, setIsForcedOffline] = useState(
    localStorage.getItem('dev_force_offline') === 'true'
  );

  useEffect(() => {
    if (!IS_DEV_MODE) {
      window.__FORCE_OFFLINE__ = false;
      return;
    }
    localStorage.setItem('dev_force_offline', isForcedOffline);
    // Expose globally so other components can check it
    window.__FORCE_OFFLINE__ = isForcedOffline;
  }, [isForcedOffline]);

  const addDummyUsers = () => {
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    const newUsers = Array.from({ length: 10 }).map((_, i) => ({
      action: 'registerAndAddService',
      serviceProgram: 'General Registration',
      fullName: `Test User ${Date.now()}_${i}`,
      age: '25',
      gender: 'Other',
      address: 'Dev Mode Lane',
      contactNumber: '09000000000',
      category: 'Beneficiary',
      syncToken: `dev-token-${Date.now()}-${i}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString()
    }));
    
    localStorage.setItem('registrationQueue', JSON.stringify([...queue, ...newUsers]));
    alert('Added 10 dummy users to the offline queue!');
    window.location.reload();
  };

  const testConnection = async () => {
    try {
      const { APPS_SCRIPT_URL } = await import('../config');
      const axios = (await import('axios')).default;
      const res = await axios.get(APPS_SCRIPT_URL);
      if (res.data.success) {
        alert('✅ Connection Successful! Script is v0.0.9 ready.');
      } else {
        alert('⚠️ Script responded but returned an error: ' + res.data.error);
      }
    } catch (err) {
      alert('❌ Connection Failed! Check your APPS_SCRIPT_URL and Deployment settings.');
    }
  };

  if (!IS_DEV_MODE) return null;

  return (
    <div className="fixed top-20 left-6 z-[200] flex flex-col gap-2">
      <div className={`p-1 pr-4 flex items-center gap-3 rounded-full border shadow-xl backdrop-blur-md transition-all ${
        isForcedOffline ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
      }`}>
        <button
          onClick={() => setIsForcedOffline(!isForcedOffline)}
          className={`p-2 rounded-full transition-all ${
            isForcedOffline ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
          }`}
        >
          {isForcedOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Dev Mode</span>
          <span className="text-[9px] font-mono font-bold uppercase leading-none opacity-70">
            {isForcedOffline ? 'Forced Offline' : 'Network Active'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <button
          onClick={addDummyUsers}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-all shadow-lg border border-white/10"
        >
          <Bug size={12} />
          Add 10 Dummy Users
        </button>
        
        <button
          onClick={testConnection}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-50 transition-all shadow-lg border border-gray-200"
        >
          <Wifi size={12} className="text-emerald-500" />
          Test Script Connection
        </button>
      </div>
      
      {isForcedOffline && (
        <div className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse text-center uppercase tracking-tighter">
          Simulating Outage
        </div>
      )}
    </div>
  );
};

export default DevTools;
