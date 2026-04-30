import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { ADMIN_PIN } from '../config';

const AdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN code');
      setPin('');
    }
  };

  if (isChecking) return null;

  if (isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-[var(--color-primary)]/5 border-b border-gray-50">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-[var(--color-primary)] mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-headline font-extrabold text-gray-900">Admin Login</h2>
          <p className="text-sm text-gray-500 font-body mt-2">Enter your PIN to access the dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-mono tracking-widest text-lg"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2 absolute -bottom-6 left-1 font-body">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors mt-8"
          >
            Access Dashboard
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
