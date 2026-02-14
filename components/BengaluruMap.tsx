import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface BengaluruMapProps {
  activeZoneId: string | null;
  activeColor?: string;
}

// High-resolution coordinates (x10 scaling)
const ZONES: Record<string, string> = {
  yelahanka: "M 480,50 L 580,80 L 650,120 L 720,250 L 680,350 L 600,400 L 450,380 L 350,300 L 320,150 Z",
  dasarahalli: "M 150,250 L 350,300 L 320,450 L 180,420 L 100,320 Z",
  mahadevapura: "M 680,350 L 850,380 L 980,520 L 920,750 L 750,780 L 620,650 L 620,450 L 600,400 Z",
  east: "M 450,380 L 600,400 L 620,450 L 620,650 L 550,680 L 480,600 Z",
  west: "M 320,450 L 450,380 L 480,600 L 380,650 L 250,500 Z",
  south: "M 480,600 L 550,680 L 620,650 L 750,780 L 520,820 L 380,650 Z",
  rr_nagar: "M 120,520 L 250,500 L 380,650 L 400,800 L 250,880 L 100,750 Z",
  bommanahalli: "M 400,800 L 520,820 L 750,780 L 820,920 L 550,1020 L 300,900 Z",
};

const BengaluruMap: React.FC<BengaluruMapProps> = ({ activeZoneId, activeColor = '#00f0ff' }) => {
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Global drag handling
  React.useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      setPan({
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.001;
    setScale(s => Math.min(Math.max(s + delta, 0.5), 5));
  };

  const handleReset = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <style>{`
        @keyframes dash-flow {
          to {
            stroke-dashoffset: -2000;
          }
        }
        .animate-border-flow {
          animation: dash-flow 40s linear infinite;
        }
      `}</style>

      <div 
        className="absolute inset-0 flex items-center justify-center z-0 touch-none overflow-hidden"
        onWheel={handleWheel}
      >
        <div 
          className="relative w-[1100px] h-[1100px] transition-transform duration-100 ease-out origin-center"
          onPointerDown={handlePointerDown}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
           <svg 
              viewBox="0 0 1100 1100" 
              className="w-full h-full overflow-visible" 
              shapeRendering="geometricPrecision"
            >
             <defs>
               <filter id="glow-2d" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="5" result="blur"/>
                 <feComposite in="SourceGraphic" in2="blur" operator="over"/>
               </filter>
             </defs>
             
             {/* Map Background Ghost */}
             <g className="opacity-10 pointer-events-none">
                {Object.values(ZONES).map((path, i) => (
                   <path key={i} d={path} fill="none" stroke="white" strokeWidth="2" />
                ))}
             </g>

             {Object.entries(ZONES).map(([id, path]) => {
               const isActive = activeZoneId === id;
               
               return (
                 <g key={id} 
                    className="transition-all duration-300 ease-out"
                    style={{ 
                      opacity: activeZoneId && !isActive ? 0.2 : 1,
                    }}
                  >
                   {/* 1. Base Fill (Glassy) */}
                   <path 
                     d={path}
                     fill={isActive ? activeColor : "#000000"}
                     fillOpacity={isActive ? 0.15 : 0.0}
                     stroke="none"
                     className="transition-all duration-300"
                   />

                   {/* 2. Static Outline */}
                   <path 
                     d={path}
                     fill="none" 
                     stroke={isActive ? activeColor : "#ffffff"} 
                     strokeWidth={isActive ? "2" : "1"}
                     strokeOpacity={isActive ? 0.8 : 0.2}
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     vectorEffect="non-scaling-stroke"
                     className="transition-all duration-300"
                   />

                   {/* 3. Animated Continuous Line (The "Marching Ants") */}
                   <path 
                     d={path}
                     fill="none" 
                     stroke={isActive ? activeColor : "#ffffff"} 
                     strokeWidth={isActive ? "3" : "1.5"}
                     strokeOpacity={isActive ? 1 : 0.4}
                     strokeDasharray="15, 15"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     vectorEffect="non-scaling-stroke"
                     className={`animate-border-flow transition-all duration-300`}
                     style={{ 
                       filter: isActive ? 'url(#glow-2d)' : 'none',
                     }}
                   />
                 </g>
               );
             })}
           </svg>
        </div>
      </div>

      {/* 2D Map Controls - Zoom Only */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-4 z-50">
         <div className="bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl flex flex-col gap-2">
            <ControlBtn onClick={() => setScale(s => Math.min(s + 0.2, 5))} icon={<ZoomIn size={20} />} />
            <ControlBtn onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} icon={<ZoomOut size={20} />} />
            <div className="h-px bg-white/20 mx-2" />
            <ControlBtn onClick={handleReset} icon={<RefreshCw size={18} />} />
         </div>
      </div>
    </>
  );
};

const ControlBtn: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button 
    onClick={onClick}
    className="w-12 h-12 bg-white/5 hover:bg-white hover:text-black text-white rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/10"
  >
    {icon}
  </button>
);

export default BengaluruMap;