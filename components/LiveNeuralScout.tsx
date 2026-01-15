
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { X, Mic, MicOff, Radio, Waves, ShieldCheck, Activity, Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import { ksm } from '../stateManager';

interface LiveNeuralScoutProps {
  onClose: () => void;
}

export const LiveNeuralScout: React.FC<LiveNeuralScoutProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [modelResponse, setModelResponse] = useState<string>("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("API_MEDIA_NOT_SUPPORTED");
      }

      setIsConnecting(true);
      setHasStarted(true);
      setError(null);
      
      let stream;
      try {
        // Intento con restricciones avanzadas para mejor calidad
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (err: any) {
        console.warn("Retrying getUserMedia with basic audio constraints...");
        try {
          // Fallback a restricciones básicas si las avanzadas fallan (común en algunos dispositivos móviles)
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (fallbackErr: any) {
          console.error("Media Device Error:", fallbackErr);
          if (fallbackErr.name === 'NotFoundError' || fallbackErr.name === 'DevicesNotFoundError') {
            setError("MICROPHONE_NOT_FOUND: No se detectó ningún micrófono físico o el sistema no puede encontrarlo.");
          } else if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
            setError("PERMISSION_DENIED: El acceso al micrófono fue bloqueado por el usuario o el navegador.");
          } else {
            setError(`MEDIA_ERROR: ${fallbackErr.message || 'Error al acceder al hardware de audio.'}`);
          }
          setIsConnecting(false);
          return;
        }
      }
      
      streamRef.current = stream;

      // Inicialización de AudioContexts
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      await audioContextRef.current.resume();
      await outAudioContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            ksm.logActivity('SYSTEM', 'Neural Link Established. Live mode active.', 'high');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setModelResponse(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setTranscription("");
              setModelResponse("");
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Session Error:', e);
            setError("CONEXIÓN_FALLIDA: Error de sincronización con el servidor neural.");
            setIsActive(false);
            setIsConnecting(false);
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
            cleanupMedia();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'Eres el Meta-Orquestador KAIROS. Análisis deportivo bilateral en tiempo real. Cumple estrictamente la REGLA DE ORO (Props solo al ganador). Responde de forma concisa y técnica.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start Live Link:', err);
      setError(`FALLO_CRÍTICO: ${err.message || 'No se pudo iniciar el enlace neural.'}`);
      setIsConnecting(false);
    }
  };

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  };

  const stopSession = () => {
    cleanupMedia();
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
    onClose();
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (sessionRef.current) sessionRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-scan-lines opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-2xl bg-virtus-bg border border-virtus-aztecCyan/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,243,255,0.2)] flex flex-col relative">
        <div className="p-6 border-b border-white/5 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 rounded-xl ${isActive ? 'animate-pulse' : ''}`}>
              <Radio className="w-5 h-5 text-virtus-aztecCyan" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural Live Link v4.0</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : (error ? 'bg-red-500' : 'bg-amber-500')} animate-pulse`}></div>
                <span className="text-[10px] text-gray-500 font-mono uppercase">
                  {isConnecting ? 'Establishing Sync...' : isActive ? 'Link Active' : error ? 'Sync Interrupted' : 'Awaiting Authorization'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={stopSession} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[400px] space-y-12">
          {!hasStarted ? (
            <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="p-10 bg-virtus-aztecCyan/5 border border-virtus-aztecCyan/20 rounded-full relative group">
                <div className="absolute inset-0 bg-virtus-aztecCyan/10 blur-2xl rounded-full group-hover:bg-virtus-aztecCyan/20 transition-all"></div>
                <Mic className="w-20 h-20 text-virtus-aztecCyan relative z-10" />
              </div>
              <div className="space-y-4 max-w-sm">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Preparado para Escaneo por Voz</h3>
                <p className="text-xs text-gray-500 font-mono leading-relaxed uppercase tracking-widest">
                  Se requiere acceso al micrófono para el análisis bilateral en tiempo real.
                </p>
              </div>
              <button 
                onClick={startSession}
                className="px-12 py-4 bg-virtus-aztecCyan border border-virtus-aztecCyan text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_#00f3ff] transition-all transform hover:scale-[1.05]"
              >
                Establecer Enlace Neural
              </button>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center space-y-8 animate-in slide-in-from-top-4 duration-500">
              <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <div className="space-y-4 max-w-sm">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Fallo en Dispositivo de Audio</h3>
                <p className="text-xs text-red-400 font-mono leading-relaxed bg-red-500/5 p-4 rounded-2xl border border-red-500/20 uppercase tracking-tighter">
                  {error}
                </p>
                <div className="text-[9px] text-gray-600 uppercase font-mono mt-4">
                  Sugerencia: Verifica que el micrófono esté conectado, no esté en uso por otra aplicación y que los permisos del navegador estén concedidos.
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => startSession()} 
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reintentar Sync
                </button>
                <button 
                  onClick={onClose} 
                  className="px-8 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-12 animate-in fade-in duration-700">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className={`absolute inset-0 border-2 border-virtus-aztecCyan/20 rounded-full ${isActive ? 'animate-ping' : ''}`}></div>
                <div className={`absolute inset-4 border-2 border-virtus-aztecCyan/40 rounded-full ${isActive ? 'animate-pulse' : ''}`}></div>
                <div className="p-8 bg-black border border-virtus-aztecCyan/50 rounded-full shadow-[0_0_40px_rgba(0,243,255,0.2)] relative z-10">
                  {isActive ? <Mic className="w-12 h-12 text-virtus-aztecCyan" /> : <RefreshCw className="w-12 h-12 text-virtus-aztecCyan animate-spin" />}
                </div>
              </div>

              <div className="w-full space-y-4 max-w-md">
                {transcription && (
                  <div className="bg-black/60 border border-white/5 rounded-3xl p-5 animate-in slide-in-from-bottom-2 shadow-inner group">
                    <span className="text-[8px] font-black text-gray-600 uppercase mb-3 block tracking-widest">Operator Input Stream</span>
                    <p className="text-[11px] text-gray-300 font-mono leading-relaxed uppercase tracking-tighter">{transcription}</p>
                  </div>
                )}
                {modelResponse && (
                  <div className="bg-virtus-aztecCyan/5 border border-virtus-aztecCyan/20 rounded-3xl p-5 animate-in slide-in-from-bottom-2 shadow-[0_0_20px_rgba(0,243,255,0.05)]">
                    <span className="text-[8px] font-black text-virtus-aztecCyan uppercase mb-3 block tracking-widest">KAIROS Core Response</span>
                    <p className="text-[11px] text-white font-mono leading-relaxed uppercase tracking-tighter font-bold">{modelResponse}</p>
                  </div>
                )}
                {!transcription && !modelResponse && isActive && (
                  <div className="text-center">
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.5em] animate-pulse">Escuchando parámetros tácticos...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[9px] text-gray-600 font-mono">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-virtus-aztecCyan" />
              <span>SAMP_RATE: 16KHZ</span>
            </div>
            <div className="flex items-center gap-2">
              <Waves size={12} className="text-purple-400" />
              <span>VOICE: ZEPHYR</span>
            </div>
          </div>
          <button 
            onClick={stopSession}
            className="px-8 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <MicOff size={14} /> Desconectar Enlace
          </button>
        </div>
      </div>
    </div>
  );
};
