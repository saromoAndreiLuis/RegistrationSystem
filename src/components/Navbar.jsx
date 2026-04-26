import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Home, Wifi, WifiOff, CloudUpload } from 'lucide-react';
import { APP_VERSION } from '../config';
import { useSyncQueue } from '../hooks/useSyncQueue';

const Navbar = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queueLength = useSyncQueue();

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const isLanding = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Registration', path: '/register', icon: ClipboardList },
    { name: 'Admin', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isLanding ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img src="/tglfi-logo.png" alt="Logo" className="w-9 h-9 rounded-full object-contain bg-white p-0.5 shadow-sm transition-transform group-hover:scale-110" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-[var(--color-primary)] text-lg leading-tight">TGLFI</span>
                <span className="text-[10px] font-body text-gray-400 uppercase tracking-wider leading-tight">Outreach System</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-headline font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)]'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Version & Status */}
            <div className="flex items-center gap-4">
              {queueLength > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-sm animate-pulse">
                  <CloudUpload size={12} />
                  <span>{queueLength} Pending</span>
                </div>
              )}
              <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {APP_VERSION}
              </span>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar (Bottom) */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 px-6 py-3 flex justify-between items-center z-[100] border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 ${
        isLanding ? 'bg-transparent' : 'bg-white/90 backdrop-blur-lg'
      }`}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-bold uppercase">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Navbar;
