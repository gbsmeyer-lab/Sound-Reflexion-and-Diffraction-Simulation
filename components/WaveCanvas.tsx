import React, { useEffect, useRef } from 'react';
import { AcousticMetrics } from '../types';

interface WaveCanvasProps {
  frequency: number;
  obstacleSize: number;
  metrics: AcousticMetrics;
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ frequency, obstacleSize, metrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      if (!canvas || !container || !ctx) return;

      // Handle resize dynamically
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Only resize if dimensions change to avoid flicker
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Dynamic Scale: Ensure the visualization fits nicely even in a shorter window
      // We want to fit at least ~6m height (max obstacle 5m + padding) if possible, 
      // but not zoom out too much on small screens.
      // Default was 100px/m. Now we adjust based on height.
      const PIXELS_PER_METER = Math.min(60, height / 6);

      const centerX = width / 2;
      const centerY = height / 2;
      const sourceX = width * 0.15; // Source on the left
      const obstacleX = centerX;
      
      // Convert physical units to pixels
      // Limit max drawn wavelength so low freq doesn't break visual
      const wavelengthPx = metrics.wavelength * PIXELS_PER_METER;
      const obstacleHeightPx = obstacleSize * PIXELS_PER_METER;
      const obstacleWidthPx = 15; 

      // Clear
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid (1m grid)
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += PIXELS_PER_METER) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += PIXELS_PER_METER) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Determine Opacity of Shadow vs Wrapped Waves based on ratio
      const diffractionFactor = Math.max(0, Math.min(1, 1.5 - metrics.ratio)); 

      // Draw Waves
      const maxRadius = Math.hypot(width, height);
      const waveSpeedPx = 2; 
      const phaseOffset = (time * waveSpeedPx) % wavelengthPx;

      ctx.lineWidth = 2;
      
      ctx.save();

      // Define Obstacle Bounds
      const obsTop = centerY - obstacleHeightPx / 2;
      const obsBottom = centerY + obstacleHeightPx / 2;

      // 1. Draw Incident Waves
      for (let r = phaseOffset; r < maxRadius; r += wavelengthPx) {
        const intensity = Math.max(0, 1 - r / (maxRadius * 0.8)); 
        ctx.strokeStyle = `rgba(56, 189, 248, ${intensity})`; // Sky blue
        
        ctx.beginPath();
        ctx.arc(sourceX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Draw Shadow Zone
      ctx.fillStyle = `rgba(9, 9, 11, ${1 - diffractionFactor})`; 
      ctx.beginPath();
      ctx.moveTo(obstacleX, obsTop);
      ctx.lineTo(width, obsTop - (width - obstacleX) * 0.3); 
      ctx.lineTo(width, obsBottom + (width - obstacleX) * 0.3);
      ctx.lineTo(obstacleX, obsBottom);
      ctx.closePath();
      ctx.fill();

      // 3. Draw Reflected Waves (if applicable)
      if (metrics.ratio > 0.8) {
        const reflectionOpacity = Math.min(1, (metrics.ratio - 0.6));
        for (let r = phaseOffset; r < maxRadius; r += wavelengthPx) {
           const distToObs = obstacleX - sourceX;
           if (r > distToObs) {
             const reflectedRadius = r - distToObs;
             if (reflectedRadius > 0) {
                const intensity = Math.max(0, (1 - reflectedRadius / (width * 0.5)) * reflectionOpacity * 0.6);
                ctx.strokeStyle = `rgba(248, 113, 113, ${intensity})`; 
                ctx.beginPath();
                ctx.arc(obstacleX, centerY, reflectedRadius, Math.PI * 0.5, Math.PI * 1.5); 
                ctx.stroke();
             }
           }
        }
      }

      // Draw Obstacle
      ctx.fillStyle = metrics.behavior === 'REFLECTING' ? '#f87171' : metrics.behavior === 'TRANSITIONAL' ? '#fbbf24' : '#4ade80';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
      ctx.fillRect(obstacleX, obsTop, obstacleWidthPx, obstacleHeightPx);
      ctx.shadowBlur = 0;

      // Draw Source
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sourceX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Labels
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px sans-serif';
      ctx.fillText("Schallquelle", sourceX - 25, centerY - 12);
      ctx.fillText("Hindernis", obstacleX - 20, obsTop - 8);

      ctx.restore();

      time++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [frequency, obstacleSize, metrics]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Compact Overlay Legend */}
      <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-sm px-3 py-2 rounded border border-zinc-800 text-[10px] shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
           <div className="w-2 h-2 rounded-full bg-[#38bdf8]"></div>
           <span className="text-zinc-300">Welle (Eingang)</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#f87171]"></div>
           <span className="text-zinc-300">Reflexion</span>
        </div>
      </div>
    </div>
  );
};

export default WaveCanvas;