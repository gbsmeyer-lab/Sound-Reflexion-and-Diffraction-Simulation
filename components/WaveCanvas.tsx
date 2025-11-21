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

    // Scale: 1 meter = 100 pixels for visualization
    const PIXELS_PER_METER = 100; 
    
    const render = () => {
      if (!canvas || !container || !ctx) return;

      // Handle resize
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const sourceX = width * 0.15; // Source on the left
      const obstacleX = centerX;
      
      // Convert physical units to pixels
      const wavelengthPx = metrics.wavelength * PIXELS_PER_METER;
      const obstacleHeightPx = obstacleSize * PIXELS_PER_METER;
      const obstacleWidthPx = 20; // Fixed thickness for visualization

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
      // Ratio > 1 = Reflection (Strong Shadow)
      // Ratio < 1 = Diffraction (Waves wrap around)
      // We blend between 0 and 1
      const diffractionFactor = Math.max(0, Math.min(1, 1.5 - metrics.ratio)); 
      // If ratio is 0.5 (D < L), factor is 1 (Full Diffraction)
      // If ratio is 1.5 (D > L), factor is 0 (Full Reflection)

      // Draw Waves
      // We draw concentric circles from source
      const maxRadius = Math.hypot(width, height);
      // Speed of animation - purely visual relative to frequency
      const waveSpeedPx = 2; 
      const phaseOffset = (time * waveSpeedPx) % wavelengthPx;

      ctx.lineWidth = 2;
      
      // Save context for complex clipping
      ctx.save();

      // Define Obstacle Path
      const obsTop = centerY - obstacleHeightPx / 2;
      const obsBottom = centerY + obstacleHeightPx / 2;

      // 1. Draw "Incident" Waves (Left of obstacle)
      // We just draw full circles, but we will overlay the shadow later
      for (let r = phaseOffset; r < maxRadius; r += wavelengthPx) {
        const intensity = Math.max(0, 1 - r / (maxRadius * 0.8)); // Fade out with distance
        ctx.strokeStyle = `rgba(56, 189, 248, ${intensity})`; // Sky blue
        
        ctx.beginPath();
        ctx.arc(sourceX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Draw "Shadow" Zone Logic
      // The shadow is the area behind the obstacle (Right side).
      // If Reflecting, we darken this area.
      // If Diffracting, we let the waves show through.
      
      // Create a shadow mask path
      // Simple approximation: A trapezoid or rectangle extending from obstacle
      ctx.fillStyle = `rgba(9, 9, 11, ${1 - diffractionFactor})`; // Black overlay, opacity depends on reflection
      ctx.beginPath();
      ctx.moveTo(obstacleX, obsTop);
      ctx.lineTo(width, obsTop - (width - obstacleX) * 0.2); // Slight spread
      ctx.lineTo(width, obsBottom + (width - obstacleX) * 0.2);
      ctx.lineTo(obstacleX, obsBottom);
      ctx.closePath();
      ctx.fill();

      // 3. Draw "Reflected" Waves (Visual sugar)
      // Only if reflecting significantly
      if (metrics.ratio > 0.8) {
        const reflectionOpacity = Math.min(1, (metrics.ratio - 0.6));
        for (let r = phaseOffset; r < maxRadius; r += wavelengthPx) {
           // Check if wave has hit obstacle
           const distToObs = obstacleX - sourceX;
           if (r > distToObs) {
             // Draw reflected arc moving left
             // Virtual source is mirrored? Or just simple concentric reflected waves
             // Simple approach: Waves emanating from obstacle face back to left
             const reflectedRadius = r - distToObs;
             if (reflectedRadius > 0) {
                const intensity = Math.max(0, (1 - reflectedRadius / (width * 0.5)) * reflectionOpacity * 0.5);
                ctx.strokeStyle = `rgba(248, 113, 113, ${intensity})`; // Red for reflection
                ctx.beginPath();
                ctx.arc(obstacleX, centerY, reflectedRadius, Math.PI * 0.5, Math.PI * 1.5); // Left semicircle
                ctx.stroke();
             }
           }
        }
      }

      // Draw Obstacle
      ctx.fillStyle = metrics.behavior === 'REFLECTING' ? '#f87171' : metrics.behavior === 'TRANSITIONAL' ? '#fbbf24' : '#4ade80';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(obstacleX, obsTop, obstacleWidthPx, obstacleHeightPx);
      ctx.shadowBlur = 0;

      // Draw Source Point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sourceX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Source Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText("Quelle", sourceX - 20, centerY - 15);
      
      // Obstacle Label
      ctx.fillText("Hindernis", obstacleX - 20, obsTop - 10);

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
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Overlay Stats on Canvas */}
      <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur p-3 rounded border border-zinc-700 text-xs">
        <div className="flex items-center gap-2 mb-1">
           <div className="w-3 h-3 rounded-full bg-[#38bdf8]"></div>
           <span>Direktschall</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-[#f87171]"></div>
           <span>Reflexion</span>
        </div>
      </div>
    </div>
  );
};

export default WaveCanvas;