import React, { useEffect, useState } from 'react';

const LighthouseEasterEgg = ({ isActive, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      // Auto close after 7 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 1000); // Wait for exit animation
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onClose]);

  if (!isActive && !show) return null;

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Darken background slightly so light is visible */}
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] transition-opacity duration-1000"></div>

      {/* The Lighthouse */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-1000 transform ${show ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        
        {/* Sweeping Light Beam */}
        <div className="absolute bottom-[230px] left-1/2 origin-bottom -translate-x-1/2 w-[200vw] h-[150vh] lighthouse-beam"></div>

        {/* Lighthouse Structure */}
        <div className="relative w-32 h-64 flex flex-col items-center">
          
          {/* Light Bulb (Top) */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full shadow-[0_0_60px_rgba(253,224,71,1)] flex items-center justify-center z-10 border-4 border-slate-800 relative">
             {/* Cute Face ( ˘ ▽ ˘ ) */}
             <div className="flex flex-col items-center gap-0.5 mt-1">
               <div className="flex gap-3">
                 <div className="w-2.5 h-1 border-b-2 border-slate-800 rounded-full"></div>
                 <div className="w-2.5 h-1 border-b-2 border-slate-800 rounded-full"></div>
               </div>
               <div className="w-2 h-2 border-b-2 border-slate-800 rounded-full"></div>
               <div className="flex gap-4 absolute top-6">
                 <div className="w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></div>
                 <div className="w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></div>
               </div>
             </div>
          </div>
          
          {/* Roof line */}
          <div className="w-20 h-2 bg-slate-800 rounded-full -mt-2 z-20"></div>

          {/* Base */}
          <div className="w-24 flex-1 bg-white border-4 border-slate-800 border-b-0 rounded-t-lg relative overflow-hidden flex flex-col items-center z-0">
            {/* Red Stripes */}
            <div className="w-full h-8 bg-red-500 mt-4 border-y-4 border-slate-800"></div>
            <div className="w-full h-8 bg-red-500 mt-6 border-y-4 border-slate-800"></div>
            <div className="w-full h-8 bg-red-500 mt-6 border-y-4 border-slate-800"></div>
            
            {/* Little door */}
            <div className="absolute bottom-0 w-8 h-12 bg-slate-800 rounded-t-full flex justify-center pt-2">
               <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full ml-3 mt-4"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LighthouseEasterEgg;
