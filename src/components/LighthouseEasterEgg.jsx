import React, { useEffect, useState } from 'react';

const LighthouseEasterEgg = ({ isActive, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 1000);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onClose]);

  if (!isActive && !show) return null;

  return (
    <div 
      onClick={() => { 
        setShow(false); 
        setTimeout(onClose, 1000); 
      }}
      className={`fixed inset-0 z-50 transition-opacity duration-1000 ${show ? 'opacity-100 pointer-events-auto cursor-pointer' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0a0f1e]/70 backdrop-blur-[2px]" />

      {/* Stars ✨ */}
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 55}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.2,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 1.5}s`,
          }}
        />
      ))}

      {/* Lighthouse + Beam wrapper — rising from bottom */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-1000 ${show ? 'translate-y-0' : 'translate-y-[150%]'}`}
        style={{ transformOrigin: 'bottom center' }}
      >
        {/* === BEAM: anchored to the lantern room, sweeps outward === */}
        {/* The beam origin is at the center of the lantern room (top of lighthouse).
            The lighthouse tower is 180px tall. Lantern room center is ~230px from bottom of this div.
            We position the beam origin there and let it sweep. */}
        <div
          className="lighthouse-beam"
          style={{
            position: 'absolute',
            // center the beam pivot at the lantern
            bottom: '228px',
            left: '50%',
            // huge trapezoid fan shape expanding upward
            width: '0',
            height: '0',
            transformOrigin: '0 0',
          }}
        />

        {/* Fallback: CSS conic-gradient beam that sweeps */}
        <div
          style={{
            position: 'absolute',
            bottom: '220px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
          }}
        >
          <div className="lighthouse-beam-fan" />
        </div>

        {/* === LIGHTHOUSE STRUCTURE === */}
        <div className="relative flex flex-col items-center" style={{ width: '120px' }}>

          {/* ── LANTERN ROOM (the glowing top) ── */}
          <div className="relative flex flex-col items-center">
            {/* Lantern room cage — octagonal frame */}
            <div
              className="relative z-20 flex items-center justify-center"
              style={{
                width: '52px',
                height: '52px',
                background: 'rgba(255,245,150,0.25)',
                border: '3px solid #1e293b',
                borderRadius: '8px',
                boxShadow: '0 0 40px 20px rgba(253,224,71,0.6), 0 0 80px 40px rgba(253,224,71,0.3)',
              }}
            >
              {/* The actual glowing bulb */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #fffde7 30%, #ffd600 70%, #ff8f00 100%)',
                  boxShadow: '0 0 20px 8px rgba(255,214,0,0.9)',
                }}
              />

              {/* Cute face on the bulb */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {/* Eyes */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <div style={{ width: '5px', height: '3px', borderBottom: '2px solid #4a3000', borderRadius: '50%' }} />
                  <div style={{ width: '5px', height: '3px', borderBottom: '2px solid #4a3000', borderRadius: '50%' }} />
                </div>
                {/* Smile */}
                <div style={{ width: '10px', height: '5px', borderBottom: '2px solid #4a3000', borderRadius: '50%' }} />
                {/* Blush */}
                <div style={{ display: 'flex', gap: '14px', position: 'absolute', top: '12px' }}>
                  <div style={{ width: '5px', height: '3px', background: '#ffb3c1', borderRadius: '50%', opacity: 0.7 }} />
                  <div style={{ width: '5px', height: '3px', background: '#ffb3c1', borderRadius: '50%', opacity: 0.7 }} />
                </div>
              </div>

              {/* Glass pane lines (cross-hatching on cage) */}
              <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', background: 'rgba(30,41,59,0.4)', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', background: 'rgba(30,41,59,0.4)', transform: 'translateY(-50%)' }} />
            </div>

            {/* Lantern room roof — pointed cap */}
            <div
              style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '32px solid transparent',
                borderRight: '32px solid transparent',
                borderBottom: '22px solid #1e293b',
                zIndex: 30,
              }}
            />
            {/* Roof top finial */}
            <div style={{
              position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
              width: '6px', height: '12px', background: '#1e293b', borderRadius: '50% 50% 0 0', zIndex: 31
            }} />

            {/* Gallery railing below lantern room */}
            <div style={{
              width: '68px', height: '8px', background: '#1e293b',
              borderRadius: '4px', marginTop: '-2px', zIndex: 25,
              position: 'relative',
            }}>
              {/* Railing posts */}
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute', bottom: '0', left: `${8 + i * 13}px`,
                  width: '3px', height: '10px', background: '#1e293b', borderRadius: '2px 2px 0 0'
                }} />
              ))}
            </div>
          </div>

          {/* ── TOWER BODY ── */}
          <div
            style={{
              width: '80px',
              height: '160px',
              background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
              border: '3px solid #1e293b',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {/* Red diagonal stripes */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 18px, rgba(220,38,38,0.85) 18px, rgba(220,38,38,0.85) 36px)',
            }} />

            {/* Small window */}
            <div style={{
              position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)',
              width: '18px', height: '22px', background: '#93c5fd',
              border: '2px solid #1e293b', borderRadius: '50% 50% 0 0',
              boxShadow: '0 0 6px rgba(147,197,253,0.7)',
            }} />

            {/* Door */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '24px', height: '36px', background: '#1e293b',
              borderRadius: '50% 50% 0 0',
            }}>
              <div style={{
                position: 'absolute', right: '4px', top: '14px',
                width: '4px', height: '4px', background: '#fbbf24', borderRadius: '50%',
              }} />
            </div>
          </div>

          {/* ── BASE / FOUNDATION ── */}
          <div style={{
            width: '100px', height: '22px',
            background: '#334155',
            borderRadius: '4px 4px 0 0',
            border: '3px solid #1e293b',
            borderBottom: 'none',
          }} />

          {/* Sea / ground line */}
          <div style={{
            width: '160px', height: '12px',
            background: 'linear-gradient(to right, #1d4ed8, #2563eb, #1d4ed8)',
            borderRadius: '6px 6px 0 0',
            opacity: 0.85,
          }}>
            {/* Tiny wave shimmer */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginTop: '2px' }} />
          </div>
        </div>
      </div>

      <style>{`
        .lighthouse-beam-fan {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 220vw;
          height: 130vh;
          background: conic-gradient(
            from 270deg at 50% 100%,
            transparent 0deg,
            rgba(253,224,71,0.06) 25deg,
            rgba(253,224,71,0.35) 50deg,
            rgba(253,224,71,0.06) 75deg,
            transparent 100deg
          );
          border-radius: 50% 50% 0 0;
          transform-origin: 50% 100%;
          animation: lighthouse-sweep 3s ease-in-out forwards;
        }
        @keyframes lighthouse-sweep {
          0%   { transform: translateX(-50%) rotate(-60deg); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(-50%) rotate(90deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LighthouseEasterEgg;
