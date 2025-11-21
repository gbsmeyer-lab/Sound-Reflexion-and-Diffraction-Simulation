import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Loader2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { AcousticMetrics } from '../types';

interface GeminiAssistantProps {
  metrics: AcousticMetrics;
  frequency: number;
  obstacleSize: number;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ metrics, frequency, obstacleSize }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset explanation when params change significantly to encourage re-analysis
  useEffect(() => {
    // Optional: Clear explanation on major changes if desired, 
    // but keeping it might be better for UX until user clicks.
  }, [metrics.behavior]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!process.env.API_KEY) {
          throw new Error("API Key fehlt.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Als Experte für Audio-Visuelle Medien, erkläre extrem kurz und prägnant auf Deutsch:
        Szenario: Schallwelle ${frequency} Hz trifft auf ${obstacleSize.toFixed(2)}m Hindernis.
        Verhalten: ${metrics.behavior === 'REFLECTING' ? 'Reflexion' : metrics.behavior === 'DIFFRACTING' ? 'Beugung (Diffraktion)' : 'Übergangsbereich'}.

        Bitte fasse dich extrem kurz (max. 30 Wörter, 1-2 Sätze). 
        Nenne nur das physikalische Kernphänomen und ein Mini-Beispiel.
        Keine Einleitung, keine Floskeln.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setExplanation(response.text || "Keine Antwort erhalten.");
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setError("Dienst nicht verfügbar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          KI Analyse
        </h3>
        <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="text-[10px] bg-purple-600/90 hover:bg-purple-500 text-white px-2.5 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {explanation ? "Neu laden" : "Analysieren"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/30 p-2 rounded text-red-200 text-[10px] flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> {error}
        </div>
      )}

      {explanation ? (
        <div className="relative">
             <div className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-800/30 p-2.5 rounded border border-zinc-700/30 max-h-[80px] overflow-y-auto custom-scrollbar">
                {explanation}
             </div>
        </div>
      ) : (
        !loading && (
            <div className="text-zinc-600 text-[10px] italic text-center py-2 border border-dashed border-zinc-800 rounded">
                Klicke auf "Analysieren" für Kurz-Info.
            </div>
        )
      )}
    </div>
  );
};

export default GeminiAssistant;