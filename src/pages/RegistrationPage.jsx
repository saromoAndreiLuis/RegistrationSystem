import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';

const RegistrationPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-neutral)] relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-white hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all shadow-sm group"
        >
          <Home size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-headline font-semibold text-sm">Back to Home</span>
        </Link>
      </div>
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[var(--color-tertiary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md mb-8 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[var(--color-text-headline)] tracking-tight">
          Community Outreach
        </h2>
        <p className="mt-3 text-base text-[var(--color-text-body)] max-w-sm mx-auto font-body">
          Join our program by filling out the registration form below. Your data is secure.
        </p>
      </div>

      <div className="relative z-10 px-4 w-full">
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
