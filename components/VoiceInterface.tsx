import React, { useEffect, useState, useRef } from 'react';
import { Mic, PhoneOff, Radio, AlertCircle } from 'lucide-react';
import { GeminiLiveClient } from '../services/liveClient';

export const VoiceInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const clientRef = useRef<GeminiLiveClient | null>(null);

  useEffect(() => {
    clientRef.current = new GeminiLiveClient(
      (vol) => setVolume(vol),
      () => {
        setIsConnected(false);
        setVolume(0);
      }
    );

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const toggleConnection = async () => {
    setErrorMsg(null);
    if (isConnected) {
      clientRef.current?.disconnect();
      setIsConnected(false);
      setVolume(0);
    } else {
      try {
        await clientRef.current?.connect();
        setIsConnected(true);
      } catch (error: any) {
        console.error("Failed to connect voice:", error);
        setErrorMsg(error.message || "Error de conexión. Verifica tu API Key o permisos de micrófono.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className={`absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Status Badge */}
      <div className="absolute top-8 flex flex-col items-center z-10">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          isConnected 
            ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {isConnected ? (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              EN VIVO
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
              DESCONECTADO
            </>
          )}
        </span>
        {isConnected && <p className="mt-2 text-sm text-slate-500">Hablando con Sofia (Paisa)</p>}
      </div>

      {/* Visualizer Circle */}
      <div className="relative z-10 mb-12 mt-8">
        <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
          isConnected ? 'border-indigo-100' : 'border-slate-100'
        }`}>
          <div 
            className={`rounded-full bg-indigo-600 transition-all duration-75 flex items-center justify-center shadow-lg ${isConnected ? 'opacity-100' : 'opacity-20'}`}
            style={{
              width: isConnected ? `${60 + (volume * 1.2)}px` : '60px',
              height: isConnected ? `${60 + (volume * 1.2)}px` : '60px',
            }}
          >
            <Mic className="text-white w-8 h-8" />
          </div>
          
          {isConnected && (
             <>
               <div className="absolute inset-0 border-4 border-indigo-200 rounded-full opacity-0 animate-ping" />
               <div className="absolute -inset-4 border border-indigo-100 rounded-full opacity-0 animate-pulse" style={{ animationDuration: '2s'}} />
             </>
          )}
        </div>
      </div>

      {/* Controls & Errors */}
      <div className="z-10 w-full text-center">
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Llamada de Voz con IA</h3>
            <p className="text-slate-500 mb-6 px-4">
              Habla con nuestra especialista paisa en tiempo real. Latencia ultra baja.
            </p>
            <button
              onClick={toggleConnection}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center mx-auto space-x-2"
            >
              <Radio size={20} />
              <span>Iniciar Llamada</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 font-medium animate-pulse">Escuchando...</p>
            <button
              onClick={toggleConnection}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center mx-auto space-x-2"
            >
              <PhoneOff size={20} />
              <span>Terminar</span>
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-xs text-slate-400 z-10">
        Powered by Gemini 2.5 Flash Native Audio
      </div>
    </div>
  );
};