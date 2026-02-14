import React from 'react';

interface ConnectionLayerProps {
  startX: number;
  startY: number;
  // Center of screen usually
  targetX: number;
  targetY: number;
  active: boolean;
  color: string;
}

const ConnectionLayer: React.FC<ConnectionLayerProps> = ({ startX, startY, targetX, targetY, active, color }) => {
  if (!active) return null;

  // Generate 3 varying control points for the "web" effect
  // Line 1: Circuit style (90 deg turns)
  const midX = (startX + targetX) / 2;
  const path1 = `M ${startX},${startY} L ${midX},${startY} L ${midX},${targetY} L ${targetX},${targetY}`;

  // Line 2: Direct with curve
  const path2 = `M ${startX},${startY} Q ${startX},${targetY} ${targetX},${targetY}`;

  // Line 3: Offset Circuit
  const path3 = `M ${startX},${startY} L ${startX},${(startY + targetY)/2} L ${targetX},${(startY + targetY)/2} L ${targetX},${targetY}`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Beam 1 */}
      <path d={path1} fill="none" stroke={`url(#grad1)`} strokeWidth="1" className="animate-pulse opacity-60">
        <animate attributeName="stroke-dasharray" from="0, 1000" to="1000, 0" dur="2s" repeatCount="indefinite" />
      </path>

      {/* Beam 2 */}
      <path d={path2} fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="5,5" className="animate-[spin_3s_linear]">
      </path>

      {/* Beam 3 */}
      <path d={path3} fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.2">
         <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </path>
      
      {/* Node at start */}
      <circle cx={startX} cy={startY} r="3" fill={color} className="animate-ping" />
      {/* Node at target */}
      <circle cx={targetX} cy={targetY} r="2" fill="white" />
    </svg>
  );
};

export default ConnectionLayer;
