import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, WifiOff, Camera, Lock, Unlock, Search } from 'lucide-react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';
import QRScanner from './QRScanner';
import PatientIDCard from './PatientIDCard';
import BarcodeListener from './BarcodeListener';
import { APPS_SCRIPT_URL } from '../config';
import { usePatientCache } from '../context/PatientCacheContext';

const SERVICE_PROGRAMS = ['CWOP', 'Blood Letting', 'Blood Extraction', 'General Registration'];

const getProgramTypes = (service) => {
  switch (service) {
    case 'CWOP': return ['Medical', 'Dental', 'Optical', 'Cervical', 'Breast Cancer Screening', 'Laboratory', 'Hairstyle', 'Physical Therapy', 'OB-GYN', 'PEDIA', 'DERMA'];
    case 'Blood Letting': return ['Donor'];
    default: return [];
  }
};

const EMPTY_FORM = {
  action: 'registerAndAddService',
  serviceProgram: '',
  programType: '',
  fullName: '',
  age: '',
  gender: '',
  address: '',
  contactNumber: '',
  category: '',
  bloodType: '',
  lastDonationDate: '',
  referredBy: '',
  patientId: ''
};

const padId = (id) => String(id || '').padStart(4, '0');

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const RegistrationForm = () => {
  const [searchParams] = useSearchParams();
  const existingPatientId = searchParams.get('patientId');
  const { findPatientById } = usePatientCache();

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    action: existingPatientId ? 'addService' : 'registerAndAddService',
    fullName: searchParams.get('fullName') || '',
    age: searchParams.get('age') || '',
    gender: searchParams.get('gender') || '',
    address: searchParams.get('address') || '',
    contactNumber: searchParams.get('contactNumber') || '',
    category: searchParams.get('category') || '',
    patientId: existingPatientId || ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isPatientLocked, setIsPatientLocked] = useState(!!existingPatientId);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedPatient, setScannedPatient] = useState(null);
  const [newRegistrationId, setNewRegistrationId] = useState(null);
  const [manualId, setManualId] = useState('');
  const [isProgramLocked, setIsProgramLocked] = useState(false);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const isProcessingQueue = React.useRef(false);

  const labTestOptions = [
    { id: 'bloodchem', label: 'Bloodchem' },
    { id: 'cbc', label: 'CBC' },
    { id: 'urinalysis', label: 'Urinalysis' },
    { id: 'xray', label: 'X-Ray' }
  ];

  const toggleLabTest = (testLabel) => {
    setSelectedLabTests(prev => 
      prev.includes(testLabel) 
        ? prev.filter(t => t !== testLabel) 
        : [...prev, testLabel]
    );
  };

  // Offline queue processing
  useEffect(() => {
    const handleOnline = () => processQueue();
    window.addEventListener('online', handleOnline);
    const interval = setInterval(processQueue, 10000);
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  // Handle program locking from URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== 'general-registration') {
      let programToLock = '';
      if (urlCategory === 'wellness-outreach') programToLock = 'CWOP';
      if (urlCategory === 'bloodletting') programToLock = 'Blood Letting';
      if (urlCategory === 'blood-extraction') programToLock = 'Blood Extraction';
      
      if (programToLock) {
        setFormData(prev => ({ ...prev, serviceProgram: programToLock }));
        setIsProgramLocked(true);
      }
    }
  }, [searchParams]);

  const processQueue = async () => {
    if (!navigator.onLine || isProcessingQueue.current) return;
    
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    if (queue.length === 0) return;

    isProcessingQueue.current = true;
    const remainingQueue = [];
    let processedCount = 0;

    // Create a local copy to process so we don't interfere with new items being added
    const toProcess = [...queue];
    // Clear the storage immediately so if user submits something NEW during this process, 
    // it starts a fresh queue. We will add back failures later.
    localStorage.setItem('registrationQueue', JSON.stringify([]));

    for (const data of toProcess) {
      try {
        await axios.post(APPS_SCRIPT_URL, data, { 
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          timeout: 10000 // 10s timeout to avoid hanging
        });
        processedCount++;
        
        // Throttle: Wait 1 second between items to prevent server overload
        if (toProcess.indexOf(data) < toProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error('Queue item failed, re-queueing:', err);
        remainingQueue.push(data);
      }
    }

    // Merge failed items back into any NEW items that might have been added to the queue
    const currentQueue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    localStorage.setItem('registrationQueue', JSON.stringify([...remainingQueue, ...currentQueue]));
    
    isProcessingQueue.current = false;

    if (processedCount > 0 && status !== 'loading') {
      setStatus('success');
      setStatusMessage(`Synced ${processedCount} offline registration(s).`);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleScan = useCallback((scannedId) => {
    const patient = findPatientById(scannedId);
    if (!patient) {
      setStatus('error');
      setStatusMessage(`User ID "${scannedId}" not found. Please register as a new user.`);
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setFormData(prev => ({
      ...prev,
      action: 'addService',
      fullName: patient.fullName || '',
      age: patient.age || '',
      gender: patient.gender || '',
      address: patient.address || '',
      contactNumber: patient.contactNumber || '',
      category: patient.category || '',
      patientId: padId(patient.id),
      serviceProgram: '',
      programType: '',
    }));
    setIsPatientLocked(true);
    setScannedPatient({ id: patient.id, fullName: patient.fullName });
    setManualId('');
    setStatus('idle');
    setStatusMessage('');
  }, [findPatientById]);

  const handleManualSearch = () => {
    const trimmed = manualId.trim();
    if (!trimmed) return;
    handleScan(trimmed);
  };

  const handleUnlock = () => {
    setFormData(prev => ({
      ...EMPTY_FORM,
      serviceProgram: prev.serviceProgram,
      programType: prev.programType,
    }));
    setIsPatientLocked(false);
    setScannedPatient(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'serviceProgram') {
      setFormData(prev => ({ ...prev, [name]: value, programType: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.serviceProgram) newErrors.serviceProgram = 'Service Program is required';
    const types = getProgramTypes(formData.serviceProgram);
    if (types.length > 0 && !formData.programType) newErrors.programType = 'Program Type is required';

    if (!isPatientLocked && !existingPatientId) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) newErrors.age = 'Valid age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
      else if (!phoneRegex.test(formData.contactNumber)) newErrors.contactNumber = 'Valid contact number required';
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (formData.serviceProgram === 'Blood Letting' && !formData.bloodType) {
      newErrors.bloodType = 'Blood Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Additional Laboratory validation
    if (formData.serviceProgram === 'CWOP' && formData.programType === 'Laboratory' && selectedLabTests.length === 0) {
      setErrors(prev => ({ ...prev, laboratory: 'Please select at least one laboratory test' }));
      return;
    }

    setStatus('loading');
    setStatusMessage('Connecting to database...');

    const basePayload = {
      ...formData,
      id: formData.patientId,
      eventName: formData.serviceProgram,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };

    // Prepare list of payloads (split laboratory tests if applicable)
    let payloads = [];
    if (formData.serviceProgram === 'CWOP' && formData.programType === 'Laboratory') {
      payloads = selectedLabTests.map(test => ({
        ...basePayload,
        serviceName: `LAB - ${test}`,
        syncToken: generateUUID(),
      }));
    } else {
      payloads = [{
        ...basePayload,
        serviceName: formData.programType,
        syncToken: generateUUID(),
      }];
    }

    // NETWORK-FIRST: We always try to hit the live database first.
    // We only use the offline queue if the request actually fails or times out.
    try {
      let mainId = null;
      for (const payload of payloads) {
        const response = await axios.post(APPS_SCRIPT_URL, payload, {
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          timeout: 15000 // 15s timeout
        });
        
        if (response && response.data && response.data.success) {
          mainId = response.data.patientId || response.data.id;
        } else {
          throw new Error('Server returned failure');
        }
      }

      if (formData.action === 'registerAndAddService' && mainId) {
        setNewRegistrationId(padId(mainId));
        setStatus('success');
        setStatusMessage(`Registration successful! ID: ${padId(mainId)}`);
      } else {
        setStatus('success');
        setStatusMessage('Service(s) added successfully!');
        setTimeout(() => {
          setStatus('idle');
          setStatusMessage('');
          setFormData({ ...EMPTY_FORM });
          setIsPatientLocked(false);
          setScannedPatient(null);
          setSelectedLabTests([]);
        }, 3000);
      }
    } catch (error) {
      console.warn('Live submission failed, saving to offline queue:', error);
      payloads.forEach(p => saveToQueue(p));
    }
  };

  const saveToQueue = (data) => {
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    queue.push(data);
    localStorage.setItem('registrationQueue', JSON.stringify(queue));
    setStatus('offline');
    setStatusMessage('You are offline. Registration saved and will sync when connected.');
  };

  const handleNextPatient = () => {
    setFormData({ ...EMPTY_FORM });
    setIsPatientLocked(false);
    setScannedPatient(null);
    setNewRegistrationId(null);
    setStatus('idle');
    setStatusMessage('');
  };

  const availableProgramTypes = getProgramTypes(formData.serviceProgram);

  // ── If new registration was successful, show ID card screen
  if (newRegistrationId) {
    return (
      <div className="w-full mx-auto">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={24} />
            <span className="font-headline font-semibold text-lg">{statusMessage}</span>
          </div>
          <PatientIDCard patientId={newRegistrationId} patientName={formData.fullName} />
          <button
            onClick={handleNextPatient}
            className="mt-2 text-sm text-gray-500 hover:text-[var(--color-primary)] underline transition-colors"
          >
            Register another user
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowQRScanner(false)} />
      )}

      {/* Status Messages */}
      {status === 'success' && !newRegistrationId && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" />
          <div className="text-green-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}
      {status === 'offline' && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 animate-fade-in">
          <WifiOff className="text-amber-500 mt-0.5 shrink-0" />
          <div className="text-amber-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-red-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="glass-panel p-6 sm:p-8 rounded-2xl transition-all">

        {/* ── SCAN BAR ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {/* Left: status */}
          <div className="flex items-center gap-2 mr-auto">
            {isPatientLocked ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Lock size={16} />
                <span className="text-sm font-medium font-body">
                  Returning user: <span className="font-semibold">{scannedPatient?.fullName || formData.fullName}</span>
                </span>
              </div>
            ) : (
              <BarcodeListener onScan={handleScan} />
            )}
          </div>

          {/* Middle: ID search (only when not locked) */}
          {!isPatientLocked && (
            <div className="flex items-center gap-1">
              <div className="relative">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualSearch(); }}}
                  placeholder="Type User ID..."
                  className="w-32 sm:w-40 pl-3 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] font-body transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleManualSearch}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Search User ID"
              >
                <Search size={15} className="text-gray-600" />
              </button>
            </div>
          )}

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {isPatientLocked && (
              <button
                type="button"
                onClick={handleUnlock}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Unlock size={13} /> Not this user?
              </button>
            )}
            {!isPatientLocked && (
              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm font-headline font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Camera size={15} />
                Scan QR
              </button>
            )}
          </div>
        </div>

        {/* ── TWO-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">

          {/* LEFT: Program Details + Blood Letting */}
          <div className="flex flex-col h-full">
            <div className="mb-6 p-4 bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/10">
              <h3 className="text-lg font-headline font-semibold text-[var(--color-primary)] mb-4">Program Details</h3>
              <InputField
                label="Service Program"
                name="serviceProgram"
                type="select"
                options={SERVICE_PROGRAMS}
                value={formData.serviceProgram}
                onChange={handleChange}
                error={errors.serviceProgram}
                required
                disabled={isProgramLocked}
                placeholder="Select Program"
              />
              {availableProgramTypes.length > 0 && (
                <InputField
                  label="Program Type"
                  name="programType"
                  type="select"
                  options={availableProgramTypes}
                  value={formData.programType}
                  onChange={handleChange}
                  error={errors.programType}
                  required
                  placeholder="Select Type"
                />
              )}

              {formData.serviceProgram === 'CWOP' && formData.programType === 'Laboratory' && (
                <div className="mt-4 p-4 bg-white/50 rounded-xl border border-[var(--color-primary)]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-semibold text-[var(--color-primary)] mb-3">Select Laboratory Tests:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {labTestOptions.map(test => (
                      <label key={test.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-[var(--color-primary)]/40 cursor-pointer transition-all shadow-sm">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded accent-[var(--color-primary)]"
                          checked={selectedLabTests.includes(test.label)}
                          onChange={() => toggleLabTest(test.label)}
                        />
                        <span className="text-sm font-medium text-gray-700">{test.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.laboratory && <p className="text-xs text-red-500 mt-2">{errors.laboratory}</p>}
                </div>
              )}
            </div>

            {formData.serviceProgram === 'Blood Letting' && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <h3 className="text-lg font-headline font-semibold text-red-700 mb-4">Blood Donation Info</h3>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <InputField
                      label="Blood Type"
                      name="bloodType"
                      type="select"
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']}
                      value={formData.bloodType}
                      onChange={handleChange}
                      error={errors.bloodType}
                      required
                      placeholder="Select Blood Type"
                    />
                  </div>
                  <div className="w-1/2">
                    <InputField
                      label="Last Donation Date"
                      name="lastDonationDate"
                      type="date"
                      value={formData.lastDonationDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <InputField
                  label="Referred By"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  placeholder="Name of Referrer (Optional)"
                />
              </div>
            )}
          </div>

          {/* RIGHT: Patient Details */}
          <div className="flex flex-col h-full">
            <div className="mb-6 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-headline font-semibold text-[var(--color-text-headline)]">
                  {isPatientLocked ? 'User Record' : 'User Details'}
                </h3>
                {isPatientLocked && <Lock size={14} className="text-emerald-500" />}
              </div>

              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required={!isPatientLocked && !existingPatientId}
                disabled={isPatientLocked || !!existingPatientId}
                placeholder="Juan Dela Cruz"
              />

              <div className="flex gap-4">
                <div className="w-1/3">
                  <InputField
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    error={errors.age}
                    required={!isPatientLocked && !existingPatientId}
                    disabled={isPatientLocked || !!existingPatientId}
                    placeholder="18"
                  />
                </div>
                <div className="w-2/3">
                  <InputField
                    label="Gender"
                    name="gender"
                    type="select"
                    options={['Male', 'Female', 'Other', 'Prefer not to say']}
                    value={formData.gender}
                    onChange={handleChange}
                    error={errors.gender}
                    required={!isPatientLocked && !existingPatientId}
                    disabled={isPatientLocked || !!existingPatientId}
                    placeholder="Select Gender"
                  />
                </div>
              </div>

              <InputField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                required={!isPatientLocked && !existingPatientId}
                disabled={isPatientLocked || !!existingPatientId}
                placeholder="123 Main St, Brgy. San Jose"
              />

              <div className="flex gap-4">
                <div className="w-1/2">
                  <InputField
                    label="Contact Number"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    error={errors.contactNumber}
                    required={!isPatientLocked && !existingPatientId}
                    disabled={isPatientLocked || !!existingPatientId}
                    placeholder="09123456789"
                  />
                </div>
                <div className="w-1/2">
                  <InputField
                    label="Category"
                    name="category"
                    type="select"
                    options={['Beneficiary', 'Volunteer', 'Sponsor', 'Staff', 'Other']}
                    value={formData.category}
                    onChange={handleChange}
                    error={errors.category}
                    required={!isPatientLocked && !existingPatientId}
                    disabled={isPatientLocked || !!existingPatientId}
                    placeholder="Select Category"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <SubmitButton isLoading={status === 'loading'} className="w-full">
                {(isPatientLocked || existingPatientId) ? 'Add Service to User' : 'Submit Registration'}
              </SubmitButton>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
