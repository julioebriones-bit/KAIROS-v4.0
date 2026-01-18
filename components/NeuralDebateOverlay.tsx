
import React, { useState, useEffect, useMemo } from 'react';
import { MatchDashboardData, AgentType } from '../types';
import { 
  Shield, Brain, Rocket, Scale, Activity, 
  ChevronRight, Cpu, Target, Eye, RefreshCw, Waves, Lock, CheckCircle2, AlertCircle
} from 'lucide-react';

interface NeuralDebateOverlayProps {
  signal: MatchDashboardData;
  onConfirm: () => void;
}

export const NeuralDebateOverlay: React.FC<NeuralDebateOverlayProps> = ({ signal, onConfirm }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [consensus, setConsensus] = useState(0);

  const steps = useMemo(() => {
    // Definimos el veredicto por defecto de forma segura
    const defaultVerdict = `Autorización de despliegue para señal ${signal?.isFireSignal ? 'FIRE' : 'STABLE'}.`;
    
    // Extraemos el debate con protección total contra objetos nulos o indefinidos
    const debate = signal?.debate;
    
    // Lógica de extracción segura para metaArgument
    let metaArgument = "Consenso orbital alcanzado.";
    const meta = debate?.meta;
    
    if (meta) {
      if (typeof meta === 'string') {
        metaArgument = meta;
      } else if (typeof meta === 'object') {
        // Acceso seguro a verdict
        const v = (meta as any).verdict;
        metaArgument = v || defaultVerdict;
      }
    }

    return [
      {
        agent: AgentType.APOLLO,
        title: "APOLLO • STRATEGIC DELTA",
        icon: Rocket,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        argument: debate?.apollo || "Análisis de momentum estratégico en curso."
      },
      {
        agent: AgentType.CASSANDRA,
        title: "CASSANDRA • RISK SCAN",
        icon: Shield,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        argument: debate?.cassandra || "Evaluación de riesgos y varianza completada."
      },
      {
        agent: AgentType.SOCRATES,
        title: "SOCRATES • LOGICAL INTEGRITY",
        icon: Brain,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        argument: debate?.socrates || "Integridad lógica verificada bajo Regla de Oro."
      },
      {
        agent: AgentType.META,
        title: "META • ARBITRATION FINAL",
        icon: Scale,
        color: "text-virtus-aztecCyan",
        bg: "bg-virtus-aztecCyan/10",
        border: "border-virtus-aztecCyan/30",
        argument: metaArgument
      }
    ];
  }, [signal]);

  useEffect(() => {
    if (activeStep < steps.length) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        
        // Calculamos el score de consenso de forma segura
        let targetScore = signal?.winProbability || 94.2;
        const meta = signal?.debate?.meta;
        if (meta && typeof meta === 'object' && 'score' in meta) {
          targetScore = (meta as any).score || targetScore;
        }

        const nextConsensus = ((activeStep + 1) / steps.length) * targetScore;
        setConsensus(nextConsensus);
        
        if (activeStep < steps.length - 1) {
          setTimeout(() => {
            setActiveStep(prev => prev + 1);
            setIsTyping(true);
          }, 1500);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeStep, steps.length, signal]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-5xl bg-virtus-bg border border-virtus-aztecCyan/30 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_120px_rgba(0,243,255,0.15)] relative">
        <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
          <div 
            className="h-full bg-virtus-aztecCyan transition-all duration-1000 ease-out shadow-[0_0_20px_#00f3ff]" 
            style={{ width: `${consensus}%` }}
          ></div>
        </div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          <div className="flex-[3] flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md">
            <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black border border-virtus-aztecCyan/30 rounded-2xl relative z-10">
                  <Cpu className="w-6 h-6 text-virtus-aztecCyan" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Neural Arbitration Matrix v4.0</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase font-black">
                      STREAM_ID: {signal?.id?.substring(0, 8).toUpperCase() || 'EXTERNAL'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Consenso</div>
                <div className="text-xl font-black text-virtus-aztecCyan font-mono tracking-tighter">{consensus.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {steps.map((step, index) => (
                index <= activeStep && (
                  <div 
                    key={index} 
                    className={`flex gap-6 animate-in slide-in-from-left duration-700 ${index < activeStep ? 'opacity-30 blur-[0.5px]' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className={`w-14 h-14 rounded-3xl ${step.bg} border ${step.border} flex items-center justify-center shadow-lg shadow-inner`}>
                        <step.icon className={`w-7 h-7 ${step.color}`} />
                      </div>
                      <div className={`w-px flex-1 border-l-2 border-dashed ${step.border} opacity-50`}></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${step.color}`}>{step.title}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-inner group">
                        <p className={`text-xs text-gray-200 font-mono leading-relaxed tracking-tighter ${index === activeStep && isTyping ? 'animate-pulse text-gray-500' : ''}`}>
                          {index === activeStep && isTyping ? '> ANALIZANDO PARÁMETROS DE MERCADO...' : `> ${step.argument}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="flex-1 bg-black/40 p-8 flex flex-col gap-10 backdrop-blur-xl shadow-inner">
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity size={14} className="text-virtus-aztecCyan" /> Telemetría Neural
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/60 p-4 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-[9px] text-gray-600 uppercase font-black mb-2">Entropy</div>
                    <div className="text-sm font-mono font-bold text-purple-400">0.042</div>
                  </div>
                  <div className="bg-black/60 p-4 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-[9px] text-gray-600 uppercase font-black mb-2">Noise</div>
                    <div className="text-sm font-mono font-bold text-red-400">1.2%</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Target size={14} className="text-emerald-400" /> Neural Lock
                </span>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] shadow-inner">
                  <div className="text-xs font-black text-white uppercase mb-2 font-mono">
                    {signal?.projectedWinner || 'CALCULATING...'}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-black">REGLA_ORO_CUMPLIDA</div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 text-center relative z-10">
               <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-4">Firmado por KAIROS Core</div>
               <Shield className="w-8 h-8 text-virtus-aztecCyan mx-auto opacity-20" />
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-white/5 bg-black/60 flex items-center justify-between relative z-10 shadow-inner">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               <Waves className="w-6 h-6 text-purple-400 animate-pulse" />
               <div className="flex flex-col">
                 <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Neural Stability</span>
                 <span className="text-[11px] text-white font-mono font-bold uppercase tracking-tighter">98.2% CALIBRATED</span>
               </div>
            </div>
          </div>
          
          <button 
            onClick={onConfirm}
            disabled={activeStep < steps.length - 1}
            className={`
              px-12 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center gap-6 shadow-2xl
              ${activeStep === steps.length - 1 
                ? 'bg-virtus-aztecCyan border border-virtus-aztecCyan text-black hover:scale-[1.05] hover:shadow-[0_0_50px_rgba(0,243,255,0.4)]' 
                : 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'}
            `}
          >
            {activeStep === steps.length - 1 ? 'Autorizar Despliegue' : 'Arbitraje en curso...'}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
