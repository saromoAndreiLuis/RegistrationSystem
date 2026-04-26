import React, { useState } from 'react';
import { Printer, X, Settings2 } from 'lucide-react';
import PatientIDCard from './PatientIDCard';

const PrintPreviewModal = ({ patientId, patientName, onClose }) => {
  const [saveSettings, setSaveSettings] = useState(
    localStorage.getItem('print_save_settings') === 'true'
  );
  
  const handlePrint = () => {
    if (saveSettings) {
      localStorage.setItem('print_save_settings', 'true');
    } else {
      localStorage.removeItem('print_save_settings');
    }

    if (window.confirm('Ready to print to the thermal printer? Please ensure labels are loaded.')) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print-hide">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Printer size={20} />
            <h3 className="font-headline font-bold">Print Preview</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-8 flex flex-col items-center bg-gray-100/50">
          <p className="text-xs text-center text-gray-500 mb-6 max-w-[250px]">
            This is exactly how the ID Card will appear on the physical thermal label.
          </p>
          
          {/* The actual component we print */}
          <div className="print-area w-full flex justify-center">
            <PatientIDCard patientId={patientId} patientName={patientName} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={saveSettings}
                onChange={(e) => setSaveSettings(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                <Settings2 size={14} />
                Save printer alignment settings
              </span>
            </label>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Print Label
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintPreviewModal;
