import React, { useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { Download } from 'lucide-react';

const padId = (id) => String(id || '').replace(/^'+/, '').padStart(4, '0');

const PatientIDCard = ({ patientId, patientName }) => {
  const barcodeCanvasRef = useRef(null);
  const cardRef = useRef(null);

  const idString = padId(patientId);

  useEffect(() => {
    if (barcodeCanvasRef.current && idString) {
      try {
        JsBarcode(barcodeCanvasRef.current, idString, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 4,
          background: '#ffffff',
          lineColor: '#1A1A1A',
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [idString]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    // Build a canvas manually from DOM references
    const cardEl = cardRef.current;
    const cardWidth = cardEl.offsetWidth;
    const cardHeight = cardEl.offsetHeight;
    const scale = 3;

    const offscreen = document.createElement('canvas');
    offscreen.width = cardWidth * scale;
    offscreen.height = cardHeight * scale;
    const ctx = offscreen.getContext('2d');
    ctx.scale(scale, scale);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Header background
    ctx.fillStyle = '#438E82';
    ctx.fillRect(0, 0, cardWidth, 56);

    // Logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // continue even if logo fails
      logoImg.src = '/tglfi-logo.png';
    });
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(18 + 20, 28, 20, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, 18, 8, 40, 40);
      ctx.restore();
    }

    // Org name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TGLFI', 66, 24);
    ctx.font = '10px sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Community Outreach Program', 66, 40);
    ctx.globalAlpha = 1;

    // Patient name label
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PATIENT NAME', cardWidth / 2, 78);

    // Patient name
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(patientName, cardWidth / 2, 100);

    // ID label
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px sans-serif';
    ctx.fillText('PATIENT ID', cardWidth / 2, 118);

    // Patient ID
    ctx.fillStyle = '#438E82';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(idString, cardWidth / 2, 136);

    // QR Code — grab from canvas element in DOM
    const qrCanvas = cardRef.current.querySelector('canvas.qr-canvas');
    if (qrCanvas) {
      const qrSize = 90;
      const qrX = cardWidth / 2 - qrSize - 8;
      const qrY = 148;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // QR label
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '8px sans-serif';
      ctx.fillText('QR Code', qrX + qrSize / 2, qrY + qrSize + 10);
    }

    // Barcode — grab from canvas element in DOM
    const barcodeCanvas = barcodeCanvasRef.current;
    if (barcodeCanvas) {
      const bcWidth = 120;
      const bcHeight = 60;
      const bcX = cardWidth / 2 + 8;
      const bcY = 148;
      ctx.drawImage(barcodeCanvas, bcX, bcY, bcWidth, bcHeight);

      // Barcode label
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '8px sans-serif';
      ctx.fillText('Barcode', bcX + bcWidth / 2, bcY + bcHeight + 10);
    }

    // Divider between QR and barcode (vertical line)
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardWidth / 2, 150);
    ctx.lineTo(cardWidth / 2, 240);
    ctx.stroke();

    // Footer
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, cardHeight - 28, cardWidth, 28);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '8px sans-serif';
    ctx.fillText('Present this card at every outreach event', cardWidth / 2, cardHeight - 10);

    // Download
    const link = document.createElement('a');
    link.download = `TGLFI-ID-${idString}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
  }, [idString, patientName]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The visual card (for display) */}
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        style={{ width: '340px' }}
      >
        {/* Header */}
        <div className="bg-[#438E82] px-5 py-3 flex items-center gap-3">
          <img
            src="/tglfi-logo.png"
            alt="TGLFI Logo"
            className="h-10 w-10 object-contain rounded-full bg-white p-0.5"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="text-white">
            <div className="font-bold text-sm leading-tight">TGLFI</div>
            <div className="text-xs opacity-80 leading-tight">Community Outreach Program</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">User Name</div>
            <div className="text-xl font-bold text-[#1A1A1A] leading-tight">{patientName}</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">User ID</div>
            <div className="text-base font-mono text-[#438E82] font-bold">{idString}</div>
          </div>

          {/* QR + Barcode side by side */}
          <div className="flex gap-4 items-center justify-center pt-1">
            <div className="flex flex-col items-center gap-1">
              <QRCodeCanvas
                className="qr-canvas"
                value={idString}
                size={90}
                bgColor="#ffffff"
                fgColor="#1A1A1A"
                level="M"
              />
              <span className="text-[9px] text-gray-400 uppercase tracking-wider">QR Code</span>
            </div>

            <div className="h-24 w-px bg-gray-200"></div>

            <div className="flex flex-col items-center gap-1">
              <canvas ref={barcodeCanvasRef}></canvas>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider">Barcode</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-2 text-center">
          <span className="text-[9px] text-gray-400">Present this card at every outreach event</span>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-headline font-semibold hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all shadow-sm text-sm"
      >
        <Download size={16} />
        Download ID Card
      </button>
    </div>
  );
};

export default PatientIDCard;
