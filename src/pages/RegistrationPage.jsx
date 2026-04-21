import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';

const RegistrationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] pt-20 pb-12 relative overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-white hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all shadow-sm group cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-headline font-semibold text-xs sm:text-sm">Back</span>
        </button>
      </div>
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full max-w-5xl mb-4 px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left mt-10 sm:mt-0">
        <div className="inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-[var(--color-text-headline)] tracking-tight">
            Community Outreach
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-body)] max-w-lg font-body hidden sm:block">
           Join our program by filling out the form below, or scan / type a User ID to quickly add a service for a returning user.
          </p>
        </div>
      </div>

      <div className="relative z-10 px-4 w-full max-w-5xl mx-auto">
        <RegistrationForm />
      </div>
      
      <div className="relative z-10 mt-12 text-center">
         <p className="text-sm text-gray-400 font-body">
           Powered by Google Apps Script
         </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
