import React, { useState, useMemo } from 'react';
import { Settings, Info, Waves, Box, Ruler } from 'lucide-react';
import WaveCanvas from './components/WaveCanvas';
import { calculateMetrics, SPEED_OF_SOUND_DEFAULT } from './utils/physics';
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Waves className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Schallausbreitung</h1>
              <p className="text-xs text-zinc-400">Visualisierung von Schallreflexion & Beugung</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> Schallgeschwindigkeit: {Math.round(metrics.speedOfSound)} m/s</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Changed breakpoint from lg to md to allow side-by-side on smaller screens */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Controls & Metrics */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            
            {/* Controls Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" /> Konfiguration
              </h2>
              
              {/* Frequency Slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                    <Waves className="w-3 h-3" /> Frequenz
                  </label>
                  <span className="text-blue-400 font-mono text-sm">{params.frequency} Hz</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="10"
                  value={params.frequency}
                  onChange={handleFreqChange}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Tief (Bass)</span>
                  <span>Hoch (Höhen)</span>
                </div>
              </div>

              {/* Obstacle Size Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                    <Box className="w-3 h-3" /> Hindernisgröße
                  </label>
                  <span className="text-blue-400 font-mono text-sm">{params.obstacleSize.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={params.obstacleSize}
                  onChange={handleSizeChange}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Klein</span>
                  <span>Groß</span>
                </div>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-green-400" /> Wellenlänge
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zinc-950 rounded border border-zinc-800">
                  <span className="text-zinc-400 text-sm">Wellenlänge (λ)</span>
                  <span className="text-xl font-mono font-bold text-zinc-100">{metrics.wavelength.toFixed(2)} m</span>
                </div>

                {/* Dynamic Feedback Banner */}
                <div className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors duration-500 ${
                    metrics.behavior === 'REFLECTING' 
                    ? 'bg-red-900/20 border-red-800/50 text-red-200' 
                    : metrics.behavior === 'DIFFRACTING' 
                    ? 'bg-green-900/20 border-green-800/50 text-green-200'
                    : 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200'
                }`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">Aktuelles Verhalten</span>
                  <span className="text-base font-bold">
                    {metrics.behavior === 'REFLECTING' ? 'REFLEXION DOMINIERT' : 
                     metrics.behavior === 'DIFFRACTING' ? 'BEUGUNG DOMINIERT' : 'ÜBERGANGSBEREICH'}
                  </span>
                  <p className="text-[11px] mt-2 opacity-80 leading-tight">
                     {metrics.behavior === 'REFLECTING' 
                      ? 'Hindernis > Wellenlänge. Schall wird blockiert (Schallschatten).'
                      : metrics.behavior === 'DIFFRACTING'
                      ? 'Hindernis < Wellenlänge. Schall beugt sich um das Objekt.'
                      : 'Wellenlänge ≈ Größe. Komplexe Streuungseffekte.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visualizer */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-start">
             {/* Container height fixed */}
            <div className="h-[480px] w-full">
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