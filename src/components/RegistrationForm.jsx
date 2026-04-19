import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';

// TODO: Replace this with the actual Apps Script Web App URL once deployed
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvw6kIB0e_YFUGuVeSf9G67GRGUOHzRvVFSjF16SV4d2nxueVwJjMz8P5PfWiPKAJTUw/exec';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    address: '',
    contactNumber: '',
    category: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'offline'
  const [statusMessage, setStatusMessage] = useState('');

  // Retry queued requests when online
  useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    // Periodically check queue
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
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setStatusMessage('');

    if (!navigator.onLine) {
      saveToQueue(formData);
      return;
    }

    try {
      // For Google Apps Script Web Apps, it's best to send text/plain to avoid CORS preflight issues
      const response = await axios.post(APPS_SCRIPT_URL, formData, {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });

      if (response.data.success) {
        setStatus('success');
        setStatusMessage('Registration successful!');
        setFormData({
          fullName: '',
          age: '',
          gender: '',
          address: '',
          contactNumber: '',
          category: ''
        });

        // Reset success message after a few seconds
        setTimeout(() => {
          setStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Unknown error from server');
      }
    } catch (error) {
      console.error('Submission error:', error);
      saveToQueue(formData);
    }
  };

  const saveToQueue = (data) => {
    const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
    queue.push(data);
    localStorage.setItem('registrationQueue', JSON.stringify(queue));
    setStatus('offline');
    setStatusMessage('You are offline or the server is unreachable. Your registration is saved and will be submitted automatically when connection is restored.');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Status Messages */}
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

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl transition-all">
        <InputField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          required
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
              required
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
              required
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
          required
          placeholder="123 Main St, Brgy. San Jose"
        />

        <InputField
          label="Contact Number"
          name="contactNumber"
          type="tel"
          value={formData.contactNumber}
          onChange={handleChange}
          error={errors.contactNumber}
          required
          placeholder="09123456789"
        />

        <InputField
          label="Category"
          name="category"
          type="select"
          options={['Beneficiary', 'Volunteer', 'Sponsor', 'Staff', 'Other']}
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          required
          placeholder="Select Category"
        />

        <div className="mt-8">
          <SubmitButton isLoading={status === 'loading'} className="w-full">
            Submit Registration
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
