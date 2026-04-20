import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import SubmitButton from '../components/SubmitButton';
import InputField from '../components/InputField';
import { APPS_SCRIPT_URL } from '../config';

const AddServiceModal = ({ isOpen, onClose, onAdd, eventInfo, patientId }) => {

  const [formData, setFormData] = useState({
    serviceName: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // We send action: addService to the Apps Script
    const payload = {
      action: 'addService',
      patientId: patientId,
      eventName: eventInfo.eventName,
      date: eventInfo.date,
      serviceName: formData.serviceName,
      time: formData.time,
      remarks: formData.remarks
    };

    try {
      const response = await axios.post(APPS_SCRIPT_URL, payload, {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      
      if (response.data.success) {
        onAdd({
          id: "s" + Date.now(), // Local pseudo-id for key rendering
          ...formData
        });
        setFormData({ ...formData, serviceName: '', remarks: '' });
      } else {
        alert("Failed to add service: " + response.data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not add service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-headline font-bold text-[var(--color-text-headline)]">Add New Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <InputField
            label="Service Name"
            name="serviceName"
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            required
            placeholder="e.g. Physical Checkup"
          />
          <InputField
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <InputField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Optional notes..."
          />
          <div className="mt-6">
            <SubmitButton isLoading={isSubmitting}>Save Service</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetails = () => {
  const { category, patientId, eventId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(APPS_SCRIPT_URL);
        if (response.data.success) {
          const allPatients = response.data.data.patients || [];
          const allHistory = response.data.data.history || [];
          
          const foundPatient = allPatients.find(p => String(p.id) === patientId);
          if (foundPatient) setPatient(foundPatient);
          
          // Reconstruct event details from eventId (which is encodeURIComponent(`${eventName}_${date}`))
          const decodedEventId = decodeURIComponent(eventId);
          // Format is eventName_date.
          const lastUnderscore = decodedEventId.lastIndexOf('_');
          const evName = decodedEventId.substring(0, lastUnderscore);
          const evDate = decodedEventId.substring(lastUnderscore + 1);
          
          setEventInfo({ eventName: evName, date: evDate });
          
          // Filter services for this event
          const eventServices = allHistory.filter(h => 
            String(h.patientId) === patientId && 
            h.eventName === evName && 
            String(h.date) === String(evDate)
          );
          
          // Give them pseudo-IDs for keys and sort by time (assuming time is parseable, or just leave as is)
          // The spec says "Sorted by time (latest first)". Since they are appended, reversing the array puts newest first.
          const processedServices = eventServices.map((s, idx) => ({ ...s, id: 's' + idx })).reverse();
          setServices(processedServices);
          
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
  }, [patientId, eventId]);

  const handleAddService = (newService) => {
    // Add to top of list (latest first)
    setServices([newService, ...services]);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
      </div>
    );
  }

  if (error || !eventInfo) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-headline font-bold mb-4">{error || "Event not found"}</h2>
        <button onClick={() => navigate(-1)} className="text-[var(--color-primary)] underline cursor-pointer focus:outline-none">Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="hover:text-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none">Back</button>
          <ChevronRight size={14} />
          <span className="text-[var(--color-primary)]">Services</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-[var(--color-text-headline)]">
              {eventInfo.eventName}
            </h1>
            <p className="text-sm font-body text-[var(--color-text-body)]">
              {patient?.fullName || "Patient"} • {eventInfo.date ? new Date(eventInfo.date).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-headline font-semibold hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all shadow-sm hover:shadow"
          >
            <Plus size={20} /> Add Service
          </button>
        </div>

        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm border-dashed">
              No services logged for this event yet.
            </div>
          ) : (
            services.map(service => (
              <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4 group hover:border-[var(--color-secondary)]/30 transition-colors">
                <div>
                  <h3 className="font-headline font-semibold text-[var(--color-text-headline)] text-lg mb-1">
                    {service.serviceName}
                  </h3>
                  <div className="text-sm font-body text-gray-600 bg-gray-50 inline-block px-3 py-1 rounded-md border border-gray-100">
                    <span className="font-medium text-gray-500">Remarks:</span> {service.remarks || "None"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-[var(--color-primary)] bg-[var(--color-primary)]/5 px-3 py-1.5 rounded-lg h-fit">
                  <Clock size={16} />
                  {service.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddService} 
        eventInfo={eventInfo}
        patientId={patientId}
      />
    </div>
  );
};

const ChevronRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default EventDetails;
