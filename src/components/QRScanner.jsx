import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const scannerId = 'qr-scanner-container';
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const patientId = decodedText.trim().replace(/^'+/, '');
        html5QrCode.stop().then(() => {
          onScan(patientId);
          onClose();
        }).catch(() => {
          onScan(patientId);
          onClose();
        });
      },
      () => {} // Ignore per-frame errors
    )
    .then(() => setIsStarting(false))
    .catch((err) => {
      setError('Camera access denied. Please allow camera permissions and try again.');
      setIsStarting(false);
      console.error('QR Scanner error:', err);
    });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleClose = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {}).finally(onClose);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Camera size={20} />
            <span className="font-headline font-semibold text-[var(--color-text-headline)]">Scan QR Code</span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <Camera size={48} className="text-gray-300" />
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                onClick={handleClose}
                className="mt-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {isStarting && (
                <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                  <span className="animate-pulse">Starting camera...</span>
                </div>
              )}
              <div id="qr-scanner-container" className="w-full rounded-xl overflow-hidden"></div>
              <p className="text-center text-xs text-gray-400 mt-3 font-body">
                Point the camera at the patient's QR code
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
