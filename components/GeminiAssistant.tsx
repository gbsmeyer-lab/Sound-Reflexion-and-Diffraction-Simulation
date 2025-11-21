import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
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

  // Debounce the AI call manually or wait for user interaction.
  // Given the API cost/limits, it's better to have a "Analyze" button or specific trigger.
  // However, for a "Live" feel, we can fetch when the user stops changing values, 
  // but a button is safer for the demo to avoid spamming.
  
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!process.env.API_KEY) {
          throw new Error("API Key is missing. Please provide an API_KEY in the environment.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        I am an audio visual media designer. 
        I am simulating a sound wave with Frequency: ${frequency} Hz.
        The calculated Wavelength is approximately ${metrics.wavelength.toFixed(2)} meters.
        There is an obstacle with a dimension of ${obstacleSize.toFixed(2)} meters.
        The ratio (Obstacle Size / Wavelength) is ${metrics.ratio.toFixed(2)}.
        
        Explain to me simply:
        1. Will the sound reflect off this object or diffract (bend) around it?
        2. Why does this happen based on the physics of wavelength vs object size?
        3. What is a practical real-world example of this specific frequency behavior (e.g. a pillar in a concert hall vs a wall)?
        
        Keep it concise, under 150 words. Use professional but accessible language.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setExplanation(response.text || "No explanation generated.");
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setError("Failed to generate insight. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Acoustic Insight
        </h3>
        {!loading && !explanation && (
            <button 
                onClick={handleAnalyze}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            >
                <Sparkles className="w-3 h-3" /> Analyze Scene
            </button>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm">Analyzing wave physics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-red-200 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
        </div>
      )}

      {!loading && !error && explanation && (
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50 leading-relaxed">
             {explanation}
          </div>
          <div className="mt-4 flex justify-end">
             <button 
                onClick={handleAnalyze}
                className="text-xs text-zinc-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
            >
                <Sparkles className="w-3 h-3" /> Refresh Analysis
            </button>
          </div>
        </div>
      )}
      
      {!loading && !explanation && !error && (
        <div className="text-zinc-500 text-sm italic text-center py-4">
            Click "Analyze Scene" to get a physics breakdown of the current configuration.
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
