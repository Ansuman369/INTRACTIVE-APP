import React from 'react';
import { GridModule } from '../types';

interface DockProps {
  modules: GridModule[];
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

const Dock: React.FC<DockProps> = ({ modules, onPointerDown }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-gray-900/90 to-transparent z-[100] flex items-end pb-8 justify-center pointer-events-none">
      
      {/* Dock Container - Enable pointer events here */}
      <div className="pointer-events-auto relative max-w-[90vw] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
        
        {/* Header Label */}
        <div className="absolute -top-3 bg-bescom-blue text-white text-[10px] font-bold px-4 py-1 rounded-full border border-white/20 uppercase tracking-[0.2em] shadow-lg">
          Module Repository
        </div>

        {/* Scrollable Area */}
        <div className="flex gap-8 px-8 py-6 overflow-x-auto no-scrollbar items-center max-w-full">
          {modules.length === 0 && (
            <div className="text-white/30 text-xs font-mono uppercase tracking-widest px-8">All modules active</div>
          )}

          {modules.map((mod) => (
            <div 
              key={mod.id}
              className="group flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-1"
              onPointerDown={(e) => onPointerDown(e, mod.id)}
            >
              {/* Module Capsule */}
              <div 
                className="w-14 h-20 rounded-xl bg-gradient-to-b from-gray-800 to-gray-950 border border-gray-700 shadow-xl flex items-center justify-center relative overflow-hidden group-hover:border-white/40 transition-colors"
                style={{ boxShadow: `0 10px 30px -5px ${mod.color}20` }}
              >
                 {/* Top Glint */}
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30" />
                 
                 {/* ID Text */}
                 <div className="font-black text-sm tracking-tighter z-10 group-hover:scale-110 transition-transform" style={{ color: mod.color }}>
                   {mod.iconChar}
                 </div>

                 {/* Status Light */}
                 <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mod.color, boxShadow: `0 0 8px ${mod.color}` }} />
              </div>
              
              {/* Label */}
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                {mod.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dock;