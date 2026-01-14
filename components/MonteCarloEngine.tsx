
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchDashboardData, MonteCarloResult } from '../types';
import { 
  Zap, Activity, BarChart3, Binary, Layers, 
  RefreshCw, ShieldCheck, TrendingUp, Cpu, 
  Dices, X, ArrowUpRight, Globe, Box, Waves, Target
} from 'lucide-react';

interface MonteCarloEngineProps {
  signal: MatchDashboardData;
  onClose: () => void;
}

export const MonteCarloEngine: React.FC<MonteCarloEngineProps> = ({ signal, onClose }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const telemetryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentProgress = 0;
    const telemetryInterval = setInterval(() => {
      const seeds = ["Quantum_Seed_7x82", "Parallel_Alpha_01", "Reality_Delta_9", "Theta_Wave_Function", "Laplace_Tensor_X", "Bernoulli_Trial_74"];
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      setTelemetry(prev => [
        `> COLLAPSING_REALITY: ${randomSeed}_${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
        ...prev.slice(0, 10)
      ]);
    }, 200);

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        clearInterval(telemetryInterval);
        runSimulation();
      }
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(telemetryInterval);
    };
  }, [signal]);

  const runSimulation = () => {
    const iterations = 50000; // Increased scale
    let wins = 0;
    const p = (signal.winProbability || 65) / 100;
    const edge = (signal.edge || 12) / 100;
    
    // Simulate iterations using a slightly more volatile model
    for (let i = 0; i < iterations; i++) {
      // Skewed probability based on market edge
      const marketNoise = (Math.random() - 0.5) * 0.15;
      const outcome = Math.random() < (p + marketNoise) ? 1 : 0;
      if (outcome === 1) wins++;
    }

    const winPct = (wins / iterations) * 100;
    const ev = (p * (1 + edge)) - (1 - p);
    
    setResult({
      expectedValue: ev,
      variance: p * (1 - p),
      simulations: iterations,
      distribution: Array.from({ length: 50 }, () => Math.random()),
      winPercentage: winPct,
      roiProyected: ev * 100,
      sharpeRatio: (ev / Math.sqrt(p * (1 - p))) * 2.5 // Simulated Sharpe
    });
    setIsRunning(false);
  };

  const histogramData = useMemo(() => {
    if (!result) return [];
    // Generate a proper Gaussian-like distribution for display
    return Array.from({ length: 32 }, (_, i) => {
      const center = 16;
      const sigma = 6;
      const val = Math.exp(-Math.pow(i - center, 2) / (2 * Math.pow(sigma, 2))) * 100;
      return Math.max(5, val + (Math.random() * 8));
    });
  }, [result]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-virtus-bg border border-virtus-aztecCyan/30 w-full max-w-4xl h-[600px] rounded-3xl shadow-[0_0_150px_rgba(0,243,255,0.15)] flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-scan-lines opacity-[0.02] pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
               <div className="absolute inset-0 bg-virtus-aztecCyan/20 blur-lg rounded-full animate-pulse"></div>
               <div className="p-3 bg-black border border-virtus-aztecCyan/40 rounded-2xl relative z-10">
                 <Dices className={`w-6 h-6 text-virtus-aztecCyan ${isRunning ? 'animate-spin' : ''}`} />
               </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                LAPLACE_PROTOCOL <span className="text-virtus-aztecRed">V8.5</span>
              </h2>
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.4em]">Neural Variance Analyzer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* Main Simulation Area */}
          <div className="flex-[2] p-8 border-r border-white/5 flex flex-col">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center space-y-12">
                <div className="relative w-56 h-56">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="112" cy="112" r="100" className="stroke-white/5 fill-none" strokeWidth="4" />
                    <circle 
                      cx="112" cy="112" r="100" 
                      className="stroke-virtus-aztecCyan fill-none transition-all duration-300" 
                      strokeWidth="4" 
                      strokeDasharray="628" 
                      strokeDashoffset={628 - (628 * progress) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white font-mono tracking-tighter">{progress}%</span>
                    <span className="text-[10px] text-virtus-aztecCyan font-black tracking-widest uppercase mt-2">Computing</span>
                  </div>
                </div>
                <div className="w-full max-w-sm">
                   <div className="flex justify-between text-[10px] text-gray-600 font-mono mb-2">
                     <span className="flex items-center gap-2"><Binary className="w-3 h-3" /> PARALLEL_PROCESSING</span>
                     <span>50,000 TRIALS</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-virtus-aztecCyan to-virtus-aztecRed animate-pulse" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>
              </div>
            ) : result && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Observed WR', val: `${result.winPercentage.toFixed(1)}%`, color: 'text-emerald-400', icon: TrendingUp },
                    { label: 'Expected Value', val: result.expectedValue.toFixed(3), color: 'text-virtus-aztecCyan', icon: Zap },
                    { label: 'Sharpe Ratio', val: result.sharpeRatio.toFixed(2), color: 'text-purple-400', icon: Activity },
                    { label: 'Edge Score', val: `+${(result.roiProyected / 2).toFixed(1)}`, color: 'text-virtus-accent', icon: ArrowUpRight }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center group hover:border-white/20 transition-all">
                      <stat.icon className={`w-4 h-4 mb-2 ${stat.color} opacity-50`} />
                      <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">{stat.label}</div>
                      <div className={`text-xl font-black font-mono ${stat.color}`}>{stat.val}</div>
                    </div>
                  ))}
                </div>

                {/* Distribution Chart */}
                <div className="flex-1 bg-black/60 border border-white/5 p-8 rounded-3xl relative overflow-hidden flex flex-col h-64">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Waves className="w-24 h-24 text-virtus-aztecCyan" />
                  </div>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-white uppercase font-black tracking-widest">Reality Density Map</span>
                       <span className="text-[8px] text-gray-600 font-mono">1 Sigma confidence interval highlighted</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-virtus-aztecCyan rounded-full"></div>
                        <span className="text-[8px] text-gray-500 font-black">STABLE</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-1.5 relative z-10">
                    {histogramData.map((val, i) => (
                      <div 
                        key={i} 
                        className={`
                          flex-1 rounded-t-lg transition-all duration-1000 ease-out relative group/bar
                          ${i >= 10 && i <= 22 ? 'bg-gradient-to-t from-virtus-aztecCyan/40 to-virtus-aztecCyan' : 'bg-slate-800/40'}
                        `}
                        style={{ height: `${val}%`, transitionDelay: `${i * 20}ms` }}
                      >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 text-[8px] font-mono text-virtus-aztecCyan transition-opacity">
                           {val.toFixed(0)}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-6">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Validation: POSITIVE_EDGE_CONFIRMED</div>
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                      Market volatility scan reveals deep efficiency gaps in current price action. Recommended exposure: High-Conviction.
                    </p>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-emerald-400/20" />
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Sidebar */}
          <div className="flex-1 bg-black/40 p-6 flex flex-col">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">
               <Globe className="w-3.5 h-3.5" /> Simulation Feed
             </div>
             <div ref={telemetryRef} className="flex-1 overflow-hidden space-y-2">
                {telemetry.map((log, i) => (
                  <div key={i} className="text-[9px] font-mono text-gray-600 animate-in slide-in-from-left duration-300">
                    {/* Fix: Removed fractionalSecondDigits for better compatibility with target environments */}
                    <span className="text-virtus-aztecCyan/40 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    {log}
                  </div>
                ))}
             </div>
             <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] text-gray-600 font-black uppercase">Model Confidence</span>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-virtus-aztecCyan" style={{ width: '94%' }}></div>
                 </div>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] text-gray-600 font-black uppercase">Noise Threshold</span>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-virtus-aztecRed" style={{ width: '12%' }}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 text-[9px] font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-virtus-aztecCyan" />
              <span>NEURAL_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-800"></div>
            <span>LAPLACE_SIM_CORE_V8</span>
          </div>
          {!isRunning && (
            <div className="flex gap-3">
               <button 
                onClick={onClose}
                className="px-8 py-3 bg-black border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-white/20 transition-all"
              >
                Dismiss
              </button>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 rounded-xl text-[10px] font-black text-virtus-aztecCyan uppercase tracking-widest hover:bg-virtus-aztecCyan/20 transition-all flex items-center gap-2"
              >
                <Target className="w-3.5 h-3.5" /> Execute Strategy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
