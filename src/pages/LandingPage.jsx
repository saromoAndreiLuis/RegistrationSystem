import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, ChevronRight } from 'lucide-react';
import { APP_VERSION } from '../config';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-neutral)] relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl px-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl text-[var(--color-primary)] mb-8 ring-4 ring-[var(--color-primary)]/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-[var(--color-text-headline)] tracking-tight mb-4">
          Community Outreach
          <span className="block text-[var(--color-primary)]">Registration System</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-body)] max-w-lg mx-auto font-body leading-relaxed mb-10">
          A centralized, secure, and fast platform for managing community programs, tracking patient history, and logging services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-headline font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all duration-200 ease-in-out shadow-[0_4px_14px_0_rgba(67,142,130,0.39)] hover:shadow-[0_6px_20px_rgba(67,142,130,0.23)] overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
            <ClipboardList className="relative z-10" size={22} />
            <span className="relative z-10">Use Registration System</span>
          </Link>

          <Link
            to="/admin"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-headline font-semibold text-[var(--color-primary)] bg-white border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 active:scale-[0.98] transition-all duration-200 ease-in-out shadow-sm"
          >
            <LayoutDashboard size={22} />
            <span>Go to Dashboard</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-20 text-center">
        <p className="text-sm text-gray-400 font-body">
          Powered by Google Apps Script & React
        </p>
        <p className="mt-2 text-xs text-black-300 font-mono">
          {APP_VERSION}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
