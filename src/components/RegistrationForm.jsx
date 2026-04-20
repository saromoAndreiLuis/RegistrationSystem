import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';
import { APPS_SCRIPT_URL } from '../config';

const SERVICE_PROGRAMS = ['CWOP', 'Blood Letting', 'Blood Extraction', 'General Registration'];

const getProgramTypes = (service) => {
  switch (service) {
    case 'CWOP': return ['Medical', 'Dental', 'Optical', 'Cervical', 'Hairstyle', 'Physical Therapy', 'OB-GYN', 'PEDIA', 'DERMA'];
    case 'Blood Letting': return ['Donor'];
    default: return []; 
  }
};

const RegistrationForm = () => {
  const [searchParams] = useSearchParams();
  const existingPatientId = searchParams.get('patientId');

  const [formData, setFormData] = useState({
    action: existingPatientId ? 'addService' : 'registerAndAddService',
    serviceProgram: '',
    programType: '',
    fullName: searchParams.get('fullName') || '',
    age: searchParams.get('age') || '',
    gender: searchParams.get('gender') || '',
    address: searchParams.get('address') || '',
    contactNumber: searchParams.get('contactNumber') || '',
    category: searchParams.get('category') || '',
    bloodType: '',
    lastDonationDate: '',
    referredBy: '',
    patientId: existingPatientId || ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); 
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => processQueue();
    window.addEventListener('online', handleOnline);
    const interval = setInterval(processQueue, 10000);
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  const processQueue = async () => {
    if (!navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    if (queue.length === 0) return;

    const remainingQueue = [];
    let processedCount = 0;

    for (const data of queue) {
      try {
        await axios.post(APPS_SCRIPT_URL, data, {
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        processedCount++;
      } catch (error) {
        remainingQueue.push(data);
      }
    }

    localStorage.setItem('registrationQueue', JSON.stringify(remainingQueue));
    if (processedCount > 0 && status !== 'loading') {
      setStatus('success');
      setStatusMessage(`Successfully synced ${processedCount} offline registration(s).`);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset program type when service program changes
    if (name === 'serviceProgram') {
      setFormData(prev => ({ ...prev, [name]: value, programType: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.serviceProgram) newErrors.serviceProgram = 'Service Program is required';
    
    const types = getProgramTypes(formData.serviceProgram);
    if (types.length > 0 && !formData.programType) {
      newErrors.programType = 'Program Type is required';
    }

    if (!existingPatientId) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) newErrors.age = 'Valid age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';

      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact Number is required';
      } else if (!phoneRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Please enter a valid contact number';
      }
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (formData.serviceProgram === 'Blood Letting') {
      if (!formData.bloodType) newErrors.bloodType = 'Blood Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setStatusMessage('');

    // Prepare payload for backend
    const payload = {
      ...formData,
      eventName: formData.serviceProgram, // mapping to backend expectations
      serviceName: formData.programType,  // mapping to backend expectations
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    };

    if (!navigator.onLine) {
      saveToQueue(payload);
      return;
    }

    try {
      const response = await axios.post(APPS_SCRIPT_URL, payload, {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });

      if (response.data.success) {
        setStatus('success');
        setStatusMessage(existingPatientId ? 'Service added successfully!' : 'Registration successful!');
        
        // Keep service program but clear details
        setFormData(prev => ({
          ...prev,
          fullName: existingPatientId ? prev.fullName : '',
          age: existingPatientId ? prev.age : '',
          gender: existingPatientId ? prev.gender : '',
          address: existingPatientId ? prev.address : '',
          contactNumber: existingPatientId ? prev.contactNumber : '',
          category: existingPatientId ? prev.category : '',
          bloodType: '',
          lastDonationDate: '',
          referredBy: ''
        }));

        setTimeout(() => {
          setStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Unknown error from server');
      }
    } catch (error) {
      console.error('Submission error:', error);
      saveToQueue(payload);
    }
  };

  const saveToQueue = (data) => {
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    queue.push(data);
    localStorage.setItem('registrationQueue', JSON.stringify(queue));
    setStatus('offline');
    setStatusMessage('You are offline. Registration saved and will submit when connected.');
  };

  const availableProgramTypes = getProgramTypes(formData.serviceProgram);

  return (
    <div className="w-full mx-auto">
      {status === 'success' && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" />
          <div className="text-green-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}

      {status === 'offline' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 animate-fade-in">
          <WifiOff className="text-amber-500 mt-0.5 shrink-0" />
          <div className="text-amber-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-red-800 text-sm font-medium">{statusMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="glass-panel p-6 sm:p-8 rounded-2xl transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
          
          {/* LEFT COLUMN: Program Details & Blood Donation (if applicable) */}
          <div className="flex flex-col h-full">
            {/* Step 1 & 2: Service Hierarchy */}
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
            </div>

            {/* Step 4: Conditional Fields for Blood Letting */}
            {formData.serviceProgram === 'Blood Letting' && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex-1">
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

          {/* RIGHT COLUMN: Patient Details */}
          <div className="flex flex-col h-full">
            {/* Step 3: Patient Details */}
            <div className="mb-6 flex-1">
              <h3 className="text-lg font-headline font-semibold text-[var(--color-text-headline)] mb-4">
                {existingPatientId ? 'Patient Record (Locked)' : 'Patient Details'}
              </h3>

              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required={!existingPatientId}
                disabled={!!existingPatientId}
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
                    required={!existingPatientId}
                    disabled={!!existingPatientId}
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
                    required={!existingPatientId}
                    disabled={!!existingPatientId}
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
                required={!existingPatientId}
                disabled={!!existingPatientId}
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
                      required={!existingPatientId}
                      disabled={!!existingPatientId}
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
                      required={!existingPatientId}
                      disabled={!!existingPatientId}
                      placeholder="Select Category"
                    />
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <SubmitButton isLoading={status === 'loading'} className="w-full">
                {existingPatientId ? 'Add Service to Patient' : 'Submit Registration'}
              </SubmitButton>
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
