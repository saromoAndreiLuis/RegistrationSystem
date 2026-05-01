import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle2, ArrowLeft, Calendar, ChevronRight, Loader2, AlertCircle, CreditCard, Printer, X, Droplets, Pencil, Save, RotateCcw, Plus, Edit3, Clock, Tag, MessageSquare } from 'lucide-react';
import PatientIDCard from '../components/PatientIDCard';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { usePatientCache } from '../context/PatientCacheContext';
import Skeleton from '../components/Skeleton';
import InputField from '../components/InputField';
import axios from 'axios';
import { APPS_SCRIPT_URL, API_KEY, SERVICE_PROGRAMS, getProgramTypes, generateUUID } from '../config';

const padId = (id) => String(id || '').padStart(4, '0');

const formatDate = (dateStr) => {
  if (!dateStr) return 'No Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr).split('T')[0]; // Fallback to raw string if possible
  return date.toLocaleDateString();
};

const EventItem = ({ event, category, patientId, onEdit }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="group flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-[var(--color-primary)]/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div 
        onClick={() => navigate(`/admin/${category}/${patientId}/event/${event.id}`)}
        className="flex items-center gap-4 cursor-pointer flex-1"
      >
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
          {event.services && event.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {event.services.map((s, idx) => (
                <span key={idx} className="text-[10px] bg-[var(--color-primary)]/5 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-bold">
                  {s.serviceName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event.services[0]); // For now, edit the first service in the group
          }}
          className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-all"
        >
          <Edit3 size={18} />
        </button>
        <ChevronRight size={20} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer" onClick={() => navigate(`/admin/${category}/${patientId}/event/${event.id}`)} />
      </div>
    </div>
  );
};

const ServiceModal = ({ isOpen, onClose, onSave, patientId, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    serviceName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    remarks: '',
    bloodType: '',
    lastDonationDate: '',
    referredBy: '',
    syncToken: generateUUID()
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        eventName: '',
        serviceName: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        remarks: '',
        bloodType: '',
        lastDonationDate: '',
        referredBy: '',
        syncToken: generateUUID()
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'eventName') next.serviceName = ''; // Reset service name when program changes
      return next;
    });
  };

  if (!isOpen) return null;

  const availableServices = getProgramTypes(formData.eventName);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-in zoom-in-95 duration-200 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-headline font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
              {initialData ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            {initialData ? 'Edit Service Record' : 'Add New Service Record'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              label="Service Program"
              type="select"
              name="eventName"
              options={SERVICE_PROGRAMS}
              value={formData.eventName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Service Type"
              type="select"
              name="serviceName"
              options={availableServices.length > 0 ? availableServices : ['Standard']}
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <InputField
              label="Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-4">
            {formData.eventName === 'Blood Letting' && (
              <>
                <InputField
                  label="Blood Type"
                  type="select"
                  name="bloodType"
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']}
                  value={formData.bloodType}
                  onChange={handleChange}
                />
                <InputField
                  label="Last Donation Date"
                  type="date"
                  name="lastDonationDate"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                />
                <InputField
                  label="Referred By"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                />
              </>
            )}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Remarks</p>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[120px]"
                placeholder="Notes about the service..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => onSave(formData)}
            disabled={loading}
            className="flex-1 py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg hover:bg-[var(--color-primary-dark)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {initialData ? 'Update Record' : 'Save Record'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
const PatientDetails = () => {
  const { category, patientId } = useParams();
  const navigate = useNavigate();
  const { findPatientById, getPatientHistory, loading, updatePatientInCache, updateHistoryInCache, refreshCache } = usePatientCache();
  const [showIDCard, setShowIDCard] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);

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

  const startEditing = () => {
    setEditData({ ...patient });
    setIsEditing(true);
    setMessage(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'birthDate' && value) {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        next.age = age >= 0 ? String(age) : '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const response = await axios.post(APPS_SCRIPT_URL, {
        action: 'updatePatient',
        apiKey: API_KEY,
        ...editData
      }, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });

      if (response.data.success) {
        updatePatientInCache(editData);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.data.error || 'Update failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const openAddService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const openEditService = (service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleServiceSave = async (formData) => {
    setServiceLoading(true);
    try {
      const response = await axios.post(APPS_SCRIPT_URL, {
        action: editingService ? 'updateHistory' : 'addService',
        apiKey: API_KEY,
        ...formData,
        patientId: patientId,
        id: patientId
      }, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });

      if (response.data.success) {
        // Refresh the whole cache to get the updated history with tokens
        await refreshCache(true);
        setShowServiceModal(false);
        setMessage({ type: 'success', text: `Service record ${editingService ? 'updated' : 'added'} successfully!` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.data.error || 'Operation failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setServiceLoading(false);
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
                {isEditing ? (
                  <div className="flex gap-2">
                    <InputField
                      label="First Name"
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                    <InputField
                      label="Surname"
                      name="surname"
                      value={editData.surname}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                    <InputField
                      label="Suffix"
                      name="suffix"
                      value={editData.suffix}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  </div>
                ) : (
                  patient.fullName
                )}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-mono text-[var(--color-primary)] font-bold">ID: {padId(isEditing ? editData.id : patient.id)}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  patient.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                }`}>
                  {patient.status || 'active'}
                </span>
                {(isEditing ? editData.bloodType : patient.bloodType) && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Droplets size={10} />
                    Blood Type: {isEditing ? editData.bloodType : patient.bloodType}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave} 
                    disabled={saveLoading}
                    className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
                    title="Save Changes"
                  >
                    {saveLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    disabled={saveLoading}
                    className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                    title="Cancel"
                  >
                    <RotateCcw size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={startEditing} 
                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl transition-all"
                    title="Edit Profile"
                  >
                    <Pencil size={20} />
                  </button>
                  <button 
                    onClick={() => setShowPrintModal(true)} 
                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl transition-all"
                    title="Print ID Card"
                  >
                    <Printer size={20} />
                  </button>
                  <button 
                    onClick={() => setShowIDCard(true)}
                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl transition-all"
                    title="View ID Card"
                  >
                    <CreditCard size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h2 className="font-headline font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard size={18} className="text-[var(--color-primary)]" />
                  Personal Info
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Birth Date</p>
                  {isEditing ? (
                    <InputField
                      type="date"
                      name="birthDate"
                      value={editData.birthDate}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{formatDate(patient.birthDate)}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-700">{isEditing ? editData.age : patient.age}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Gender</p>
                  {isEditing ? (
                    <InputField
                      type="select"
                      name="gender"
                      options={['Male', 'Female', 'Other', 'Prefer not to say']}
                      value={editData.gender}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{patient.gender}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Address</p>
                  {isEditing ? (
                    <InputField
                      name="address"
                      value={editData.address}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{patient.address}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Contact</p>
                  {isEditing ? (
                    <InputField
                      name="contactNumber"
                      value={editData.contactNumber}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{patient.contactNumber}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Category</p>
                  {isEditing ? (
                    <InputField
                      type="select"
                      name="category"
                      options={['Beneficiary', 'Volunteer', 'Sponsor', 'Staff', 'Other']}
                      value={editData.category}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{patient.category}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Blood Type</p>
                  {isEditing ? (
                    <InputField
                      type="select"
                      name="bloodType"
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']}
                      value={editData.bloodType}
                      onChange={handleEditChange}
                      className="!mb-0"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{patient.bloodType || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-headline font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--color-primary)]" />
                  Service History
                </h2>
                <button 
                  onClick={openAddService}
                  className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center gap-2 text-xs font-bold px-3"
                >
                  <Plus size={16} /> Add Record
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {groupedEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    category={category} 
                    patientId={patientId} 
                    onEdit={openEditService}
                  />
                ))}
                {groupedEvents.length === 0 && (
                  <div className="p-12 text-center text-gray-400 font-body">
                    No service records found.
                  </div>
                )}
              </div>
            </div>
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
            <PatientIDCard patientId={patient.id} patientName={patient.fullName} />
          </div>
        </div>
      )}

      {showPrintModal && (
        <PrintPreviewModal 
          patientId={patient.id} 
          patientName={patient.fullName} 
          onClose={() => setShowPrintModal(false)} 
        />
      )}

      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleServiceSave}
        patientId={patientId}
        initialData={editingService}
        loading={serviceLoading}
      />
    </div>
  );
};

export default PatientDetails;
