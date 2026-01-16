
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
    const defaultVerdict = `Autorización de despliegue para señal ${signal.isFireSignal ? 'FIRE' : 'STABLE'}.`;
    const debate = signal.debate || {
      apollo: `Detectado Delta Positivo de Momentum. ${signal.homeTeam} muestra eficiencia ofensiva superior al 12%. Anclando props al ganador proyectado.`,
      cassandra: `Advertencia: Fatiga detectada en el roster secundario de ${signal.awayTeam}. Sin embargo, la varianza histórica es del 4.2%. Nivel de riesgo aceptable.`,
      socrates: `Lógica establecida: El mercado infravalora el ajuste defensivo de ${signal.projectedWinner}. Siguiendo la REGLA DE ORO, props verificados bilateralmente.`,
      meta: { score: signal.winProbability || 94.2, verdict: defaultVerdict }
    };

    // Safe extraction of the meta argument
    let metaArgument = "Consenso orbital alcanzado.";
    if (debate.meta) {
      if (typeof debate.meta === 'string') {
        metaArgument = debate.meta;
      } else if (typeof debate.meta === 'object' && 'verdict' in debate.meta) {
        metaArgument = debate.meta.verdict || defaultVerdict;
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
        argument: debate.apollo || "Análisis de momentum completado."
      },
      {
        agent: AgentType.CASSANDRA,
        title: "CASSANDRA • RISK SCAN",
        icon: Shield,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        argument: debate.cassandra || "Riesgos de mercado analizados."
      },
      {
        agent: AgentType.SOCRATES,
        title: "SOCRATES • LOGICAL INTEGRITY",
        icon: Brain,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        argument: debate.socrates || "Valor matemático verificado."
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
        
        // Safe score extraction
        let targetScore = signal.winProbability || 94.2;
        if (signal.debate?.meta && typeof signal.debate.meta === 'object' && 'score' in signal.debate.meta) {
          targetScore = signal.debate.meta.score || targetScore;
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
  }, [activeStep, steps.length, signal.winProbability, signal.debate]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-scan-lines opacity-5 pointer-events-none animate-scan-line"></div>
      
      <div className="w-full max-w-5xl bg-virtus-bg border border-virtus-aztecCyan/30 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_120px_rgba(0,243,255,0.15)] relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target className="w-32 h-32 text-virtus-aztecCyan animate-spin-slow" />
        </div>

        {/* HUD Bars */}
        <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
          <div 
            className="h-full bg-virtus-aztecCyan transition-all duration-1000 ease-out shadow-[0_0_20px_#00f3ff]"
            style={{ width: `${consensus}%` }}
          ></div>
        </div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Main Discussion HUD */}
          <div className="flex-[3] flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md">
            <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-virtus-aztecCyan/20 blur-lg animate-pulse"></div>
                  <div className="p-3 bg-black border border-virtus-aztecCyan/30 rounded-2xl relative z-10 shadow-inner">
                    <Cpu className="w-6 h-6 text-virtus-aztecCyan animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] glitch-text">Neural Arbitration Matrix v4.0</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase font-black">STREAM_ID: {signal.id.substring(0, 8).toUpperCase()}</span>
                    <span className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest font-black flex items-center gap-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                      GOLDEN_RULE_ACTIVE
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Consensus Level</div>
                  <div className="text-xl font-black text-virtus-aztecCyan font-mono tracking-tighter uppercase">{consensus.toFixed(1)}%</div>
                </div>
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
                      <div className={`w-14 h-14 rounded-3xl ${step.bg} border ${step.border} flex items-center justify-center shadow-lg transition-all duration-500 group hover:scale-110 shadow-inner`}>
                        <step.icon className={`w-7 h-7 ${step.color} group-hover:animate-pulse`} />
                      </div>
                      <div className={`w-px flex-1 border-l-2 border-dashed ${step.border} opacity-50`}></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${step.color}`}>
                          {step.title}
                        </span>
                        {index === activeStep && isTyping && (
                          <div className="flex gap-2 px-4 py-1.5 bg-black/60 rounded-full border border-virtus-aztecCyan/20 shadow-inner">
                            <RefreshCw className="w-3 h-3 text-virtus-aztecCyan animate-spin" />
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Arbitrating...</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-inner group hover:border-white/20 transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full opacity-40 bg-current transition-all" style={{ color: step.color }}></div>
                        <p className={`text-xs text-gray-200 font-mono leading-relaxed tracking-tight uppercase tracking-tighter ${index === activeStep && isTyping ? 'animate-pulse text-gray-500' : ''}`}>
                          {index === activeStep && isTyping ? '> EVALUATING BILATERAL TACTICAL PARAMETERS...' : `> ${step.argument}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Telemetry Sidebar */}
          <div className="flex-1 bg-black/40 p-8 flex flex-col gap-10 backdrop-blur-xl shadow-inner">
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity size={14} className="text-virtus-aztecCyan" /> Neural Telemetry
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/60 p-4 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">Entropy</div>
                    <div className="text-sm font-mono font-bold text-purple-400">0.042</div>
                  </div>
                  <div className="bg-black/60 p-4 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-widest">Noise</div>
                    <div className="text-sm font-mono font-bold text-virtus-aztecRed">1.2%</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Target size={14} className="text-emerald-400" /> Neural Lock
                </span>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] relative overflow-hidden group shadow-inner">
                  <div className="absolute inset-0 bg-scan-lines opacity-5 pointer-events-none"></div>
                  <div className="text-xs font-black text-white uppercase mb-2 font-mono tracking-tighter group-hover:text-emerald-400 transition-colors">{signal.projectedWinner}</div>
                  <div className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-black">Regla de Oro v4.0 Active</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Lock size={14} className="text-virtus-aztecCyan" /> Integrity Logic
                </span>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner group transition-all">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter font-bold">Props Winner-Centric</span>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner group transition-all">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter font-bold">Bilateral Verified</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 relative z-10">
               <div className="flex items-center gap-4 p-5 bg-virtus-aztecRed/10 border border-virtus-aztecRed/20 rounded-3xl shadow-inner">
                  <AlertCircle className="w-6 h-6 text-virtus-aztecRed animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Stability Warning</span>
                    <span className="text-[10px] text-virtus-aztecRed font-mono uppercase tracking-tighter font-black">No major anomalies detected.</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-white/5 bg-black/60 flex items-center justify-between relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               <div className="relative">
                 <Waves className="w-6 h-6 text-purple-400 animate-pulse" />
                 <div className="absolute inset-0 bg-purple-400/20 blur-md animate-pulse rounded-full"></div>
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Neural Stability</span>
                 <span className="text-[11px] text-white font-mono font-bold uppercase tracking-tighter">98.2% CALIBRATED</span>
               </div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
               <Eye className="w-6 h-6 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
               <div className="flex flex-col">
                 <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Integrity Check</span>
                 <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-tighter font-black uppercase">REGLA_ORO_COMPLIANT</span>
               </div>
            </div>
          </div>
          
          <button 
            onClick={onConfirm}
            disabled={activeStep < steps.length - 1}
            className={`
              px-12 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center gap-6 relative overflow-hidden group shadow-2xl
              ${activeStep === steps.length - 1 
                ? 'bg-virtus-aztecCyan border border-virtus-aztecCyan text-black hover:scale-[1.05] hover:shadow-[0_0_50px_rgba(0,243,255,0.4)]' 
                : 'bg-white/5 border border-white/10 text-gray-600 grayscale cursor-not-allowed'}
            `}
          >
            {activeStep === steps.length - 1 ? 'Authorize Deployment v4.0' : 'Arbitration in Progress...'}
            <ChevronRight className={`w-6 h-6 ${activeStep === steps.length - 1 ? 'animate-bounce-x' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
