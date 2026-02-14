import React, { useState, useRef, useEffect } from 'react';
import { GridNodeProps, ContentType } from '../types';
import { 
  Zap, Activity, AlertTriangle, Server, Factory, Settings, X, Search, MapPin, Power, Loader2, Cpu
} from 'lucide-react';

const getModuleIcon = (id: string) => {
  const props = { className: "w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" };
  switch (id) {
    case 'off_grid': return <Power {...props} />;
    case 'maintenance': return <Settings {...props} />;
    case 'overload': return <AlertTriangle {...props} />;
    case 'heavy_usage': return <Activity {...props} />;
    case 'industrial': return <Factory {...props} />;
    case 'corporate': return <Server {...props} />;
    case 'renewables': return <Zap {...props} />;
    case 'ev_grid': return <Cpu {...props} />;
    default: return <Zap {...props} />;
  }
};

const GridNode: React.FC<GridNodeProps> = ({ 
  module, 
  x, 
  y, 
  onPointerDown, 
  onRemove,
  geminiContent, 
  isLoadingGemini,
  onActiveContentChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<ContentType>(null);
  const [isLanded, setIsLanded] = useState(false);
  
  // Refs for dragging detection
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    // Trigger landing animation
    const timer = setTimeout(() => setIsLanded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerDownLocal = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
    onPointerDown(e, module.instanceId, false);
  };

  const handlePointerUpLocal = (e: React.PointerEvent) => {
    const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
    if (dist > 5) {
      isDragging.current = true;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only toggle if it wasn't a drag operation
    if (!isDragging.current) {
      setIsOpen(!isOpen);
      if (isOpen) handleContentChange(null);
    }
  };

  const handleContentChange = (type: ContentType) => {
    setActiveContent(type);
    if (onActiveContentChange) onActiveContentChange(type);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(module.instanceId);
  };

  return (
    <div
      className="absolute select-none"
      style={{ 
        left: x, 
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: isOpen ? 100 : 50, // Higher z-index when open
      }}
      onPointerDown={handlePointerDownLocal}
      onPointerUp={handlePointerUpLocal}
    >
      {/* 
         MAIN MODULE BUTTON
      */}
      <div 
        onClick={handleClick}
        className={`
          relative w-20 h-20 rounded-full cursor-pointer transition-all duration-700 ease-out z-10
          ${isLanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
          ${isOpen ? 'scale-110' : 'hover:scale-105'}
        `}
      >
        {/* Radial Text - Only Visible when Open or Hovered */}
        <div className={`
           absolute inset-[-34px] pointer-events-none transition-all duration-1000
           ${isLanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
        `}>
           <svg viewBox="0 0 160 160" className="w-full h-full animate-[spin_20s_linear_infinite]">
             <defs>
                <path id="textPath" d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
             </defs>
             <text fontSize="6.5" fill={module.color} letterSpacing="3" fontWeight="600" className="drop-shadow-md">
               <textPath href="#textPath" startOffset="0%">BESCOM • SMART MODULE • {module.name.toUpperCase()} •</textPath>
             </text>
           </svg>
        </div>

        {/* Glow Ring */}
        <div className={`absolute inset-[-10px] rounded-full bg-gradient-to-tr from-transparent to-white/20 blur-xl transition-opacity duration-1000 ${isLanded ? 'opacity-100' : 'opacity-0'}`} />

        {/* Module Body */}
        <div 
          className="absolute inset-0 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500"
          style={{ 
             boxShadow: isLanded ? `0 0 30px -5px ${module.color}60` : 'none',
             borderColor: isOpen ? module.color : 'rgba(255,255,255,0.1)'
          }}
        >
           <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${module.color}40,transparent_70%)] opacity-60`} />
           <div className="relative z-10 flex flex-col items-center gap-0.5">
             {getModuleIcon(module.id)}
             <span className="text-[6px] text-white/90 font-mono tracking-widest uppercase">{module.iconChar}</span>
           </div>
        </div>
      </div>

      {/* 
          ORBITAL CONTROLS - (Outside the main button)
      */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-45 scale-50'}`}
        style={{ zIndex: 20 }}
      >
         {/* Close Button - Enable pointer-events */}
         <div 
           className="absolute -top-7 -right-7 pointer-events-auto cursor-pointer group p-2"
           onPointerDown={(e) => e.stopPropagation()} 
           onClick={handleCloseClick}
         >
            <div className="w-8 h-8 rounded-full bg-black/90 border border-red-500/50 text-red-500 flex items-center justify-center shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all">
               <X size={14} strokeWidth={3} />
            </div>
         </div>

         {/* Analyze Button */}
         <button
            onClick={(e) => { e.stopPropagation(); handleContentChange(activeContent === 'metrics' ? null : 'metrics'); }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`
              absolute top-1/2 -left-12 -translate-y-1/2 w-9 h-9 rounded-full 
              flex items-center justify-center pointer-events-auto transition-all duration-300
              ${activeContent === 'metrics' ? 'bg-white text-black scale-110 shadow-[0_0_15px_white]' : 'bg-black/90 text-white border border-white/20 hover:border-white'}
            `}
         >
            <Search size={14} />
         </button>

         {/* Map Button */}
         <button
            onClick={(e) => { e.stopPropagation(); handleContentChange(activeContent === 'zone' ? null : 'zone'); }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`
              absolute top-1/2 -right-12 -translate-y-1/2 w-9 h-9 rounded-full 
              flex items-center justify-center pointer-events-auto transition-all duration-300
              ${activeContent === 'zone' ? 'bg-white text-black scale-110 shadow-[0_0_15px_white]' : 'bg-black/90 text-white border border-white/20 hover:border-white'}
            `}
         >
            <MapPin size={14} />
         </button>
      </div>

      {/* INFO CARD */}
      <div 
        className={`
          absolute left-full top-1/2 -translate-y-1/2 ml-14 w-60 z-30 pointer-events-auto
          transition-all duration-300 origin-left
          ${activeContent ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-4 pointer-events-none'}
        `}
        onPointerDown={(e) => e.stopPropagation()}
      >
         <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl relative overflow-hidden"
              style={{ borderLeftColor: module.color, borderLeftWidth: '3px' }}>
            
            {isLoadingGemini ? (
               <div className="flex items-center gap-2 text-white/70 font-mono text-[10px] py-1">
                 <Loader2 size={12} className="animate-spin text-bescom-orange" />
                 <span>ESTABLISHING SECURE UPLINK...</span>
               </div>
            ) : (
               <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[10px] text-bescom-orange font-bold uppercase tracking-[0.2em]">
                       {activeContent === 'metrics' ? 'TECHNICAL METRICS' : 'ZONE IMPACT'}
                    </span>
                    <Activity size={12} className="text-white/40" />
                  </div>
                  <div className="text-xs text-white/90 font-sans leading-relaxed">
                     {activeContent === 'metrics' ? geminiContent?.technicalMetrics : geminiContent?.impactAnalysis}
                  </div>
               </div>
            )}
            
            <div className="absolute top-1/2 -left-3 w-3 h-[1px] bg-white/30" />
            <div className="absolute top-1/2 -left-3 w-1 h-1 bg-white rounded-full -translate-y-1/2" />
         </div>
      </div>
    </div>
  );
};

export default GridNode;