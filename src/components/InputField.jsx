import React from 'react';
import { AlertCircle } from 'lucide-react';

const InputField = ({ 
  label, 
  name, 
  type = 'text', 
  options = [], 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder = ''
}) => {
  const baseClasses = `w-full px-4 py-3 rounded-xl border focus:outline-none transition-all duration-200 ease-in-out font-body bg-white/50 backdrop-blur-sm
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
      : 'border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 hover:border-gray-300'
    }`;

  return (
    <div className="flex flex-col gap-1.5 w-full mb-4">
      <label htmlFor={name} className="text-sm font-medium text-[var(--color-text-headline)] flex gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {type === 'select' ? (
          <div className="relative">
            <select
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              className={`${baseClasses} appearance-none cursor-pointer`}
              required={required}
            >
              <option value="" disabled>{placeholder || 'Select an option'}</option>
              {options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={baseClasses}
            required={required}
          />
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      {error && (
        <span className="text-xs text-red-500 mt-1 font-body animate-pulse">{error}</span>
      )}
    </div>
  );
};

export default InputField;
