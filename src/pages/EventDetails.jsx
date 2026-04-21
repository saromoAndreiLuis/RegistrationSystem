import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Plus, X, Loader2, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import SubmitButton from '../components/SubmitButton';
import InputField from '../components/InputField';
import axios from 'axios';
import { APPS_SCRIPT_URL } from '../config';
import { usePatientCache } from '../context/PatientCacheContext';

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
          id: "s" + Date.now(),
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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
  const { findPatientById, getPatientHistory, loading, refreshCache } = usePatientCache();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const patient = findPatientById(patientId);
  
  const eventInfo = useMemo(() => {
    const decodedEventId = decodeURIComponent(eventId);
    const lastUnderscore = decodedEventId.lastIndexOf('_');
    return {
      eventName: decodedEventId.substring(0, lastUnderscore),
      date: decodedEventId.substring(lastUnderscore + 1)
    };
  }, [eventId]);

  const services = useMemo(() => {
    return getPatientHistory(patientId)
      .filter(h => h.eventName === eventInfo.eventName && String(h.date) === String(eventInfo.date))
      .reverse();
  }, [getPatientHistory, patientId, eventInfo]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Date';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
  };

  if (loading && !patient) {
    return (
      <div className="min-h-screen bg-[var(--color-neutral)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6">
          <button onClick={handleBack} className="hover:text-[var(--color-primary)] transition-colors inline-flex items-center cursor-pointer focus:outline-none">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[var(--color-primary)]">Service Logs</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-[var(--color-text-headline)]">
              {eventInfo.eventName}
            </h1>
            <p className="text-sm font-body text-gray-500">
              {patient?.fullName || "Patient"} • {formatDate(eventInfo.date)}
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-headline font-semibold hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all shadow-md"
          >
            <Plus size={20} /> Add Service
          </button>
        </div>

        <div className="space-y-1">
          {services.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl border-dashed">
              None
            </div>
          ) : (
            services.map((service, idx) => (
              <div key={idx} className="bg-white p-6 border-b last:border-b-0 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:bg-gray-50/50">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-headline font-bold text-[var(--color-primary)] text-lg">
                      [{service.serviceName}]
                    </h3>
                    <div className="h-4 w-px bg-gray-300 hidden sm:block" />
                    <span className="text-sm font-mono text-gray-500 flex items-center gap-1.5">
                      Time of input: <span className="font-bold text-gray-700">[{service.time || '00:00'}]</span>
                    </span>
                  </div>
                  <div className="mt-2 pl-4 border-l-2 border-gray-100">
                    <p className="text-sm font-body text-gray-600 italic">
                      {service.remarks ? service.remarks : "No remarks."}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={() => refreshCache()} 
        eventInfo={eventInfo}
        patientId={patientId}
      />
    </div>
  );
};

export default EventDetails;
