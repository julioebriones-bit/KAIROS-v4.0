
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { X, Mic, MicOff, Radio, Waves, ShieldCheck, Activity, Cpu, AlertCircle } from 'lucide-react';
import { ksm } from '../stateManager';

interface LiveNeuralScoutProps {
  onClose: () => void;
}

export const LiveNeuralScout: React.FC<LiveNeuralScoutProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [modelResponse, setModelResponse] = useState<string>("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

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
      setIsConnecting(true);
      setError(null);
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.error("Media Device Error:", err);
        setError("No se detectó un micrófono activo. Por favor, conecta un dispositivo y permite el acceso.");
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            ksm.logActivity('SYSTEM', 'Neural Link Established. Live mode active.', 'high');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
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
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Session Error:', e);
            setError("Error de sincronización con el servidor neural.");
            setIsActive(false);
            setIsConnecting(false);
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are KAIROS Meta-Orchestrator. Real-time bilateral sports analysis. Follow the GOLDEN RULE.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start Live Link:', err);
      setError("Fallo crítico al iniciar el enlace live.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => {
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
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural Live Link</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : (error ? 'bg-red-500' : 'bg-amber-500')} animate-pulse`}></div>
                <span className="text-[10px] text-gray-500 font-mono uppercase">
                  {isConnecting ? 'Establishing Sync...' : isActive ? 'Link Active' : error ? 'Hardware Error' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={stopSession} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[300px] space-y-12">
          {error ? (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <p className="text-sm text-red-400 font-mono max-w-xs leading-relaxed uppercase tracking-tighter">
                {error}
              </p>
              <button 
                onClick={() => startSession()} 
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10"
              >
                Reintentar Sincronización
              </button>
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className={`absolute inset-0 border-2 border-virtus-aztecCyan/20 rounded-full ${isActive ? 'animate-ping' : ''}`}></div>
                <div className={`absolute inset-4 border-2 border-virtus-aztecCyan/40 rounded-full ${isActive ? 'animate-pulse' : ''}`}></div>
                <div className="p-8 bg-black border border-virtus-aztecCyan/50 rounded-full shadow-[0_0_40px_rgba(0,243,255,0.2)]">
                  {isActive ? <Mic className="w-12 h-12 text-virtus-aztecCyan" /> : <MicOff className="w-12 h-12 text-gray-600" />}
                </div>
              </div>

              <div className="w-full space-y-4">
                {transcription && (
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 animate-in slide-in-from-bottom-2">
                    <span className="text-[8px] font-black text-gray-600 uppercase mb-2 block tracking-widest">Operator Voice</span>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed">{transcription}</p>
                  </div>
                )}
                {modelResponse && (
                  <div className="bg-virtus-aztecCyan/5 border border-virtus-aztecCyan/20 rounded-2xl p-4 animate-in slide-in-from-bottom-2">
                    <span className="text-[8px] font-black text-virtus-aztecCyan uppercase mb-2 block tracking-widest">Neural Output</span>
                    <p className="text-xs text-white font-mono leading-relaxed">{modelResponse}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[9px] text-gray-600 font-mono">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-virtus-aztecCyan" />
              <span>PCM_16KHZ</span>
            </div>
          </div>
          <button 
            onClick={stopSession}
            className="px-6 py-2 bg-virtus-aztecRed/10 border border-virtus-aztecRed/30 rounded-xl text-[9px] font-black text-virtus-aztecRed uppercase tracking-widest hover:bg-virtus-aztecRed/20 transition-all"
          >
            Cerrar Canal
          </button>
        </div>
      </div>
    </div>
  );
};
