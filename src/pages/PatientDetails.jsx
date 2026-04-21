import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle2, ArrowLeft, Calendar, ChevronRight, Loader2, AlertCircle, CreditCard, X } from 'lucide-react';
import PatientIDCard from '../components/PatientIDCard';
import { usePatientCache } from '../context/PatientCacheContext';
import Skeleton from '../components/Skeleton';

const padId = (id) => String(id || '').padStart(4, '0');

const formatDate = (dateStr) => {
  if (!dateStr) return 'No Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr).split('T')[0]; // Fallback to raw string if possible
  return date.toLocaleDateString();
};

const EventItem = ({ event, category, patientId }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/admin/${category}/${patientId}/event/${event.id}`)}
      className="group flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-[var(--color-primary)]/40 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-lg group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="font-headline font-semibold text-[var(--color-text-headline)] group-hover:text-[var(--color-primary)] transition-colors">
            {event.eventName}
          </h3>
          <p className="text-sm font-body text-gray-500">
            {formatDate(event.date)}
          </p>
          {event.serviceName && (
            <p className="text-xs text-[var(--color-primary)] font-semibold mt-1">
              {event.serviceName}
            </p>
          )}
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
    </div>
  );
};

const PatientDetails = () => {
  const { category, patientId } = useParams();
  const navigate = useNavigate();
  const { findPatientById, getPatientHistory, loading } = usePatientCache();
  const [showIDCard, setShowIDCard] = useState(false);

  const patient = findPatientById(patientId);
  const allHistory = getPatientHistory(patientId);

  // Group history by unique Event Name + Date
  const groupedEvents = useMemo(() => {
    const groups = {};
    allHistory.forEach(h => {
      const key = `${h.eventName}_${h.date}`;
      if (!groups[key]) {
        groups[key] = {
          id: encodeURIComponent(key),
          eventName: h.eventName,
          date: h.date,
          services: []
        };
      }
      groups[key].services.push(h);
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allHistory]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (category) {
      navigate(`/admin/${category}`);
    } else {
      navigate('/admin');
    }
  };

  if (loading && !patient) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="w-20 h-6 mb-6" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-6">
            <Skeleton variant="circle" className="w-16 h-16" />
            <div className="flex-1">
              <Skeleton className="w-48 h-8 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="w-24 h-5" />
                <Skeleton className="w-16 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <Skeleton className="w-32 h-6" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] pt-24 px-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-headline font-bold mb-4">User not found in cache</h2>
        <p className="text-gray-500 mb-6">Try refreshing the data from the list page.</p>
        <button onClick={handleBack} className="text-[var(--color-primary)] font-bold underline">Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={handleBack} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors cursor-pointer focus:outline-none">
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        {/* REQUESTED HEADER HIERARCHY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 flex items-center gap-6">
            <div className="p-4 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl">
              <UserCircle2 size={48} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-headline font-extrabold text-gray-900 leading-tight">
                {patient.fullName}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-mono text-[var(--color-primary)] font-bold">ID: {padId(patient.id)}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  patient.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                }`}>
                  {patient.status || 'active'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowIDCard(true)}
              className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
            >
              <CreditCard size={20} />
            </button>
          </div>
        </div>

        {/* SERVICE HISTORY PANEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-headline font-bold text-gray-800">Service History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {groupedEvents.map((group) => (
              <EventItem 
                key={group.id} 
                event={group} 
                category={category} 
                patientId={patientId} 
              />
            ))}
            {groupedEvents.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-body">
                None
              </div>
            )}
          </div>
        </div>
      </div>

      {showIDCard && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIDCard(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowIDCard(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>
            <PatientIDCard patient={patient} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
