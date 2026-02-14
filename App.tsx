import React, { useState, useRef, useEffect } from 'react';
import { GRID_MODULES } from './constants';
import GridNode from './components/Coaster'; 
import Dock from './components/Dock';
import BengaluruMap from './components/BengaluruMap';
import ConnectionLayer from './components/ConnectionLayer';
import { fetchGridDetails } from './services/geminiService';
import { GeneratedGridContent, PlacedModule, ContentType } from './types';
import { Zap } from 'lucide-react';

interface DragState {
  id: string; // Identifier (module.id)
  instanceId?: string; // If dragging existing one
  isNew: boolean;
  startX: number; // Mouse start X
  startY: number; // Mouse start Y
  originalX: number; // Element start X
  originalY: number; // Element start Y
}

const App: React.FC = () => {
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [moduleData, setModuleData] = useState<Record<string, GeneratedGridContent>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string>('#ff9933'); // Default BESCOM orange
  const [activeModuleInstanceId, setActiveModuleInstanceId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // --- GLOBAL DRAG HANDLERS ---
  useEffect(() => {
    if (!dragState) return;

    const handleWindowMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (!dragState.isNew && dragState.instanceId) {
        // Dragging existing module - update position in real-time
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;

        setPlacedModules(prev => prev.map(p => {
          if (p.instanceId === dragState.instanceId) {
            return {
              ...p,
              x: Math.max(0, Math.min(window.innerWidth, dragState.originalX + deltaX)),
              y: Math.max(0, Math.min(window.innerHeight, dragState.originalY + deltaY))
            };
          }
          return p;
        }));
      }
    };

    const handleWindowUp = (e: PointerEvent) => {
      if (dragState.isNew) {
        // Drop NEW module
        const finalX = Math.max(0, Math.min(window.innerWidth, e.clientX));
        const finalY = Math.max(0, Math.min(window.innerHeight, e.clientY));

        // Check if dropped in valid area (e.g. not back in dock roughly)
        if (finalY < window.innerHeight - 100) {
           const newInstanceId = `${dragState.id}-${Date.now()}`;
           const newModule: PlacedModule = {
             id: dragState.id,
             instanceId: newInstanceId,
             x: finalX,
             y: finalY
           };
           setPlacedModules(prev => [...prev, newModule]);
           
           if (!moduleData[dragState.id]) {
             fetchDataForModule(dragState.id);
           }
           setActiveModuleInstanceId(newInstanceId);
        }
      } 
      // Reset
      setDragState(null);
    };

    window.addEventListener('pointermove', handleWindowMove);
    window.addEventListener('pointerup', handleWindowUp);
    
    return () => {
      window.removeEventListener('pointermove', handleWindowMove);
      window.removeEventListener('pointerup', handleWindowUp);
    };
  }, [dragState, moduleData]);


  const placedIds = new Set(placedModules.map(p => p.id));
  const dockModules = GRID_MODULES.filter(s => !placedIds.has(s.id));

  const handlePointerDown = (e: React.PointerEvent, id: string, isDock: boolean, instanceId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    let originalX = 0;
    let originalY = 0;

    if (!isDock && instanceId) {
      const placed = placedModules.find(p => p.instanceId === instanceId);
      if (placed) {
        originalX = placed.x;
        originalY = placed.y;
      }
    }

    setDragState({
      id,
      instanceId,
      isNew: isDock,
      startX: e.clientX,
      startY: e.clientY,
      originalX,
      originalY
    });
    setCursorPos({ x: e.clientX, y: e.clientY });

    // Activate Highlight
    const mod = GRID_MODULES.find(m => m.id === id);
    if (mod) {
      setActiveZone(mod.zoneId);
      setActiveColor(mod.color);
      if (instanceId) setActiveModuleInstanceId(instanceId);
    }
  };

  const handleRemoveModule = (instanceId: string) => {
    setPlacedModules(prev => prev.filter(p => p.instanceId !== instanceId));
    if (activeModuleInstanceId === instanceId) {
       setActiveModuleInstanceId(null);
       setActiveZone(null);
    }
  };

  const fetchDataForModule = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    const mod = GRID_MODULES.find(s => s.id === id);
    if (mod) {
      try {
        const data = await fetchGridDetails(mod.name);
        setModuleData(prev => ({ ...prev, [id]: data }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStates(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleContentChange = (instanceId: string, modId: string, content: ContentType) => {
    if (content) {
      const mod = GRID_MODULES.find(s => s.id === modId);
      if (mod) {
        setActiveZone(mod.zoneId);
        setActiveColor(mod.color);
        setActiveModuleInstanceId(instanceId);
      }
    } else if (activeModuleInstanceId === instanceId) {
      // Refresh highlight if just clicking node
      setActiveModuleInstanceId(instanceId); 
    }
  };

  return (
    <div 
      className="relative w-screen h-screen bg-bescom-dark overflow-hidden touch-none font-sans"
    >
      {/* Background Floor Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-bescom-blue/5" 
           style={{ 
             backgroundImage: 'radial-gradient(#003366 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0f1c_90%)] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none select-none">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-bescom-orange shadow-2xl shadow-bescom-orange/20">
               <Zap className="text-bescom-blue fill-bescom-blue" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white leading-none tracking-tight">BESCOM</h1>
              <div className="h-1 w-full bg-gradient-to-r from-bescom-orange to-transparent my-1" />
              <p className="text-bescom-orange font-mono text-sm tracking-[0.3em] uppercase opacity-80">Smart Grid Command</p>
            </div>
         </div>
      </div>

      {/* MAP LAYER */}
      <BengaluruMap activeZoneId={activeZone} activeColor={activeColor} />

      {/* CONNECTION LAYER */}
      {placedModules.map((placed) => {
         const isActive = placed.instanceId === activeModuleInstanceId;
         const mod = GRID_MODULES.find(s => s.id === placed.id);
         
         return (
           <ConnectionLayer 
              key={`conn-${placed.instanceId}`}
              startX={placed.x} 
              startY={placed.y}
              targetX={dimensions.width / 2}
              targetY={dimensions.height / 2}
              active={isActive}
              color={mod?.color || '#fff'}
           />
         );
      })}

      {!process.env.API_KEY && (
        <div className="absolute top-4 right-4 z-[100] bg-bescom-orange/10 text-bescom-orange text-[10px] px-3 py-1 border border-bescom-orange/50 font-mono rounded">
            SIMULATION MODE
        </div>
      )}

      {/* MODULES LAYER */}
      {placedModules.map((placed) => {
        const mod = GRID_MODULES.find(s => s.id === placed.id);
        if (!mod) return null;
        
        return (
          <GridNode
            key={placed.instanceId}
            module={mod}
            x={placed.x}
            y={placed.y}
            onPointerDown={(e) => handlePointerDown(e, mod.id, false, placed.instanceId)}
            onRemove={() => handleRemoveModule(placed.instanceId)}
            geminiContent={moduleData[placed.id]}
            isLoadingGemini={!!loadingStates[placed.id]}
            onActiveContentChange={(content) => handleContentChange(placed.instanceId, mod.id, content)}
          />
        );
      })}

      {/* Ghost Dragging (New Module from Dock) */}
      {dragState && dragState.isNew && (
        <div 
          className="absolute z-[200] pointer-events-none"
          style={{ 
            left: cursorPos.x, 
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)'
           }}
        >
          <div 
            className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center animate-spin-slow bg-black/20 backdrop-blur-sm"
            style={{ borderColor: activeColor }}
          >
             <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: activeColor }} />
          </div>
        </div>
      )}

      <Dock modules={dockModules} onPointerDown={(e, id) => handlePointerDown(e, id, true)} />
    </div>
  );
};

export default App;