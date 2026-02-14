import React from 'react';

export interface GridModule {
  id: string;
  name: string;
  type: string;
  color: string; // Hex color for glow
  baseColor: string; // Tailwind class
  description: string;
  iconChar: string; // Fallback
  zoneId: string; // Mapping ID for Bengaluru Map
}

export interface GeneratedGridContent {
  statusUpdate: string;
  technicalMetrics: string;
  impactAnalysis: string;
}

export interface PlacedModule {
  id: string;
  instanceId: string;
  x: number;
  y: number;
}

// Updated content types for BESCOM menu
export type ContentType = 'status' | 'metrics' | 'zone' | null;

export interface GridNodeProps {
  module: GridModule;
  x: number;
  y: number;
  onPointerDown: (e: React.PointerEvent, instanceId: string, isDock: boolean) => void;
  onRemove: (instanceId: string) => void;
  geminiContent?: GeneratedGridContent | null;
  isLoadingGemini: boolean;
  onActiveContentChange?: (content: ContentType) => void;
}