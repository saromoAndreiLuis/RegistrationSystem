import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCircle2, ArrowLeft, Calendar, ChevronRight, Loader2, AlertCircle, CreditCard, X } from 'lucide-react';
import PatientIDCard from '../components/PatientIDCard';
import { APPS_SCRIPT_URL } from '../config';

const padId = (id) => String(id || '').padStart(4, '0');

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
            {event.date ? new Date(event.date).toLocaleDateString() : 'Unknown Date'}
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
    </div>
  );
};

const PatientDetails = () => {
  const { category, patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIDCard, setShowIDCard] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(APPS_SCRIPT_URL);
        if (response.data.success) {
          const allPatients = response.data.data.patients || [];
          const allHistory = response.data.data.history || [];
          
          const foundPatient = allPatients.find(p => String(p.id) === patientId);
          if (!foundPatient) {
             setError("Patient not found");
             return;
          }
          setPatient(foundPatient);
          
          // Filter history for this patient
          // Group by eventName and date to create "Events"
          // Since history is flat (patientId, eventName, date, serviceName, time), we derive events from it.
          const patientHistory = allHistory.filter(h => String(h.patientId) === patientId);
          
          const uniqueEventsMap = new Map();
          patientHistory.forEach((h, index) => {
            // Use eventName + date as a unique key for the event
            const eventKey = `${h.eventName}_${h.date}`;
            if (!uniqueEventsMap.has(eventKey)) {
              // Creating a pseudo-ID for the event based on its properties so we can route to it
              uniqueEventsMap.set(eventKey, {
                id: encodeURIComponent(eventKey),
                eventName: h.eventName,
                date: h.date
              });
            }
          });
          
          setEvents(Array.from(uniqueEventsMap.values()));
        } else {
          throw new Error(response.data.error || 'Failed to fetch data');
        }
      } catch (err) {
        console.error(err);
        setError('Could not load data from Google Sheets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-headline font-bold mb-4">{error || "Patient not found"}</h2>
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin')} className="text-[var(--color-primary)] underline cursor-pointer focus:outline-none">Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors cursor-pointer focus:outline-none">
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UserCircle2 size={80} className="text-gray-300" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-headline font-bold text-[var(--color-text-headline)] mb-1">
              {patient.fullName}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-gray-500 font-body">
              <span className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">ID:</span>
                <span className="text-[var(--color-primary)] font-mono font-bold bg-[var(--color-primary)]/5 px-2 py-0.5 rounded border border-[var(--color-primary)]/10">
                  {padId(patient.id)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Status:</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  (patient.status || 'active') === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {patient.status || 'active'}
                </span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowIDCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors font-headline font-semibold"
          >
            <CreditCard size={18} />
            View ID Card
          </button>
        </div>

        {/* History Panel */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-bold text-[var(--color-text-headline)] flex items-center gap-2">
              History
            </h2>
            <Link 
              to={`/register?patientId=${patient.id}&fullName=${encodeURIComponent(patient.fullName || '')}&age=${patient.age || ''}&gender=${encodeURIComponent(patient.gender || '')}&address=${encodeURIComponent(patient.address || '')}&contactNumber=${encodeURIComponent(patient.contactNumber || '')}&category=${encodeURIComponent(patient.category || '')}`}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              + Add Service
            </Link>
          </div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 rounded-2xl shadow-sm border-dashed">
                None (No history found)
              </div>
            ) : (
              events.map(event => (
                <EventItem key={event.id} event={event} category={category} patientId={patientId} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {showIDCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <button 
              onClick={() => setShowIDCard(false)}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-red-500 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-xl font-headline font-bold text-gray-800">User Digital ID</h3>
              <PatientIDCard patientId={padId(patient.id)} patientName={patient.fullName} />
              <p className="text-xs text-gray-400 text-center">
                This ID can be scanned at any TGLFI outreach event for instant registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
