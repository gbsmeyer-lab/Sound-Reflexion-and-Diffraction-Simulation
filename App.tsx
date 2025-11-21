import React, { useState, useMemo } from 'react';
import { Settings, Info, Waves, Box, Ruler } from 'lucide-react';
import WaveCanvas from './components/WaveCanvas';
import { calculateMetrics } from './utils/physics';
import { SimulationParams } from './types';

const App: React.FC = () => {
  // Initial State
  const [params, setParams] = useState<SimulationParams>({
    frequency: 343, // 343Hz means 1m wavelength
    obstacleSize: 1.0, // 1m obstacle
    temperature: 20,
  });

  // Derived State
  const metrics = useMemo(() => calculateMetrics(params), [params]);

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, frequency: Number(e.target.value) }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, obstacleSize: Number(e.target.value) }));
  };

  return (
    <div className="h-screen max-h-[800px] bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30 flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10 flex-none">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Waves className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-tight">AcousticFlow</h1>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wide">Mediengestalter Tool</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Schallgeschw.: {Math.round(metrics.speedOfSound)} m/s bei {params.temperature}°C</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 min-h-0">
        {/* Grid layout: 10 columns total.
            Left: 3 cols (30%).
            Right: 5 cols (50%).
            Remaining: 2 cols empty space. 
            h-full ensures it fills the flex-1 parent. */}
        <div className="h-full grid grid-cols-1 lg:grid-cols-10 gap-4">
          
          {/* LEFT COLUMN: Controls & Metrics (30% width) 
              overflow-y-auto allows scrolling just this panel if vertical space is tight */}
          <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Controls Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-lg shrink-0">
              <h2 className="text-xs font-semibold mb-3 flex items-center gap-2 text-zinc-200 uppercase tracking-wider">
                <Settings className="w-3.5 h-3.5 text-blue-400" /> Einstellungen
              </h2>
              
              {/* Frequency Slider */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                    <Waves className="w-3 h-3" /> Frequenz
                  </label>
                  <span className="text-blue-400 font-mono text-[11px]">{params.frequency} Hz</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="10"
                  value={params.frequency}
                  onChange={handleFreqChange}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                  <span>Tief</span>
                  <span>Hoch</span>
                </div>
              </div>

              {/* Obstacle Size Slider */}
              <div className="mb-1">
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                    <Box className="w-3 h-3" /> Hindernis
                  </label>
                  <span className="text-blue-400 font-mono text-[11px]">{params.obstacleSize.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={params.obstacleSize}
                  onChange={handleSizeChange}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                  <span>Klein</span>
                  <span>Groß</span>
                </div>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-lg flex flex-col shrink-0">
              <h2 className="text-xs font-semibold mb-3 flex items-center gap-2 text-zinc-200 uppercase tracking-wider">
                <Ruler className="w-3.5 h-3.5 text-green-400" /> Physik-Daten
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-zinc-950 rounded border border-zinc-800/50">
                  <span className="text-zinc-400 text-[11px]">Wellenlänge λ</span>
                  <span className="text-xs font-mono font-bold text-zinc-100">{metrics.wavelength.toFixed(2)} m</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-zinc-950 rounded border border-zinc-800/50">
                   <span className="text-zinc-400 text-[11px]">Verhältnis</span>
                   <span className={`text-xs font-mono font-bold ${metrics.ratio > 1 ? 'text-red-400' : 'text-green-400'}`}>
                     {metrics.ratio.toFixed(2)}
                   </span>
                </div>

                {/* Dynamic Feedback Banner */}
                <div className={`mt-3 p-3 rounded border flex flex-col items-center text-center transition-all duration-500 h-auto ${
                    metrics.behavior === 'REFLECTING' 
                    ? 'bg-red-900/10 border-red-800/30 text-red-200' 
                    : metrics.behavior === 'DIFFRACTING' 
                    ? 'bg-green-900/10 border-green-800/30 text-green-200'
                    : 'bg-yellow-900/10 border-yellow-800/30 text-yellow-200'
                }`}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60 mb-1">Verhalten</span>
                  <span className="text-xs font-bold mb-1">
                    {metrics.behavior === 'REFLECTING' ? 'REFLEXION' : 
                     metrics.behavior === 'DIFFRACTING' ? 'BEUGUNG' : 'ÜBERGANG'}
                  </span>
                  <p className="text-[10px] opacity-80 leading-snug max-w-[90%]">
                     {metrics.behavior === 'REFLECTING' 
                      ? 'Hindernis > Welle. "Schatten" entsteht.'
                      : metrics.behavior === 'DIFFRACTING'
                      ? 'Hindernis < Welle. Schall umfließt es.'
                      : 'Komplexe Streuung.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visualizer (50% width) */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0">
            
            {/* Wave Canvas 
                Reduced height to h-1/2 as requested
            */}
            <div className="w-full h-1/2 relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner shrink-0">
               <WaveCanvas 
                  frequency={params.frequency} 
                  obstacleSize={params.obstacleSize}
                  metrics={metrics}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;