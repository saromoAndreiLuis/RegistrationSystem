import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Settings2 } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

const padId = (id) => String(id || '').replace(/^'+/, '').padStart(4, '0');

const ThermalLabel = ({ patientId, patientName }) => {
  const barcodeRef = useRef(null);
  const idString = padId(patientId);

  useEffect(() => {
    if (barcodeRef.current && idString) {
      try {
        JsBarcode(barcodeRef.current, idString, {
          format: 'CODE128',
          width: 2,
          height: 35,
          displayValue: false,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [idString]);

  return (
    <div className="thermal-label-container bg-white border border-gray-300 shadow-sm flex flex-col justify-center items-center p-2" style={{ width: '50mm', height: '30mm' }}>
      <div className="text-center w-full font-sans flex flex-col items-center">
        <h1 className="text-[12px] font-bold text-black leading-tight truncate mb-1" style={{ maxWidth: '100%' }}>
          {patientName}
        </h1>
        
        <div className="flex justify-center items-center gap-3 w-full">
          <div className="flex flex-col items-center">
             <QRCodeSVG value={idString} size={38} level="M" />
             <span className="text-[6px] font-bold text-gray-600 uppercase mt-[1px]">QR Code</span>
          </div>
          <div className="flex flex-col items-center">
             <svg ref={barcodeRef} className="max-w-full h-auto" style={{ maxHeight: '11mm' }}></svg>
             <span className="text-[6px] font-bold text-gray-600 uppercase mt-[1px]">Barcode</span>
          </div>
        </div>
        
        <p className="text-[10px] font-bold text-black font-mono leading-tight mt-0.5">
          ID: {idString}
        </p>
      </div>
    </div>
  );
};

const PrintPreviewModal = ({ patientId, patientName, onClose }) => {
  const [autoPrint] = useState(localStorage.getItem('print_save_settings') === 'true');
  const [saveSettings, setSaveSettings] = useState(autoPrint);
  
  useEffect(() => {
    if (autoPrint) {
      // Small delay to ensure the SVG barcode renders before the print dialog is triggered
      const timer = setTimeout(() => {
        window.print();
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, onClose]);

  const handlePrint = () => {
    if (saveSettings) {
      localStorage.setItem('print_save_settings', 'true');
    } else {
      localStorage.removeItem('print_save_settings');
    }

    // Direct print call. Avoid window.confirm as it forces the browser out of fullscreen mode.
    window.print();
  };

  const modalContent = autoPrint ? (
    <div className="fixed inset-0 z-[200] print-hide-modal pointer-events-none">
      {/* Hidden container that only shows during printing */}
      <div className="print-area hidden">
         <ThermalLabel patientId={patientId} patientName={patientName} />
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print-hide-modal">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col hide-in-print">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Printer size={20} />
            <h3 className="font-headline font-bold">Thermal Label Preview</h3>
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
            Optimized for thermal barcode printers (e.g. 50x30mm).
          </p>
          
          {/* The actual component we print */}
          <div className="flex justify-center bg-gray-200 p-4 rounded-lg shadow-inner">
             <ThermalLabel patientId={patientId} patientName={patientName} />
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
      
      {/* Hidden container that only shows during printing */}
      <div className="print-area hidden">
         <ThermalLabel patientId={patientId} patientName={patientName} />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PrintPreviewModal;
