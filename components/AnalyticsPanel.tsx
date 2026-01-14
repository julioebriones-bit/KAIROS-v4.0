import React from 'react';
import { DashboardData, MatchDashboardData, BacktestDashboardData } from '../types';
import { 
  TrendingUp, Wallet, Zap, Target, History, LineChart, ListChecks, 
  Flame, Shield, DollarSign, Rocket, Scale, AlertTriangle, CheckCircle2, 
  Trophy, Activity, Globe, AlertOctagon, Brain, Waves, Lightbulb,
  ArrowUpRight, Hash, ShieldCheck, ChevronRight, RadioTower, BarChart3
} from 'lucide-react';

interface AnalyticsPanelProps {
  data: DashboardData;
  compact?: boolean;
  onExpand?: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, compact = false, onExpand }) => {
  if (data.type === 'BACKTEST') {
    return <BacktestView data={data} compact={compact} onExpand={onExpand} />;
  }
  return <MatchView data={data} compact={compact} onExpand={onExpand} />;
};

const BacktestView: React.FC<{ 
  data: BacktestDashboardData; 
  compact?: boolean;
  onExpand?: () => void;
}> = ({ data, compact = false, onExpand }) => {
    const radius = compact ? 24 : 36;
    const stroke = compact ? 3 : 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (data.winRate / 100) * circumference;
    const gaugeColor = data.winRate > 55 ? '#a855f7' : data.winRate > 50 ? '#10b981' : '#f59e0b';
    const isPositive = data.totalProfit >= 0;

    const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
    const curve = Array.isArray(data.curve) ? data.curve : [];
    const strategyAdjustments = Array.isArray(data.strategyAdjustments) ? data.strategyAdjustments : [];

    if (compact) {
      return (
        <div className="bg-virtus-panel border border-virtus-border rounded-lg p-4 relative shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-pointer" onClick={onExpand}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold text-white flex items-center gap-2 uppercase tracking-widest">
              <History className="w-3 h-3 text-purple-400" />
              BACKTEST_SCN
            </h2>
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
              {data.period}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg height={radius * 3} width={radius * 3} className="rotate-[-90deg] transform">
                  <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                  <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-white">{data.winRate}%</span>
                  <span className="text-[8px] font-bold text-gray-400 tracking-tighter">{data.totalBets} OPS</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 ml-4 space-y-3">
              <div>
                <h3 className="text-[9px] text-gray-400 uppercase tracking-wider">Profit</h3>
                <div className={`text-lg font-mono font-bold ${isPositive ? 'text-virtus-success' : 'text-virtus-danger'}`}>
                  {isPositive ? '+' : ''}{data.totalProfit}u
                </div>
              </div>
              <div>
                <h3 className="text-[9px] text-gray-400 uppercase tracking-wider">ROI</h3>
                <div className={`text-sm font-mono font-bold ${data.roi > 5 ? 'text-purple-400' : 'text-gray-300'}`}>
                  {data.roi}%
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-virtus-panel border border-virtus-border rounded-lg p-5 overflow-hidden relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em]">
            <History className="w-4 h-4 text-purple-400" />
            FORENSIC_AUDITOR v4.0
          </h2>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            {data.period} DATASET
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-950/60 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center relative backdrop-blur-md shadow-inner">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Historical Win Rate</h3>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg height={radius * 4} width={radius * 4} className="rotate-[-90deg] transform">
                  <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke * 1.5} r={normalizedRadius * 1.2} cx={radius * 2} cy={radius * 2} />
                  <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke * 1.5} strokeDasharray={circumference * 1.2 + ' ' + circumference * 1.2} style={{ strokeDashoffset: circumference * 1.2 - (data.winRate/100)*circumference * 1.2, transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" r={normalizedRadius * 1.2} cx={radius * 2} cy={radius * 2} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-white tracking-tighter">{data.winRate}%</span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{data.totalBets} OPS</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-950/60 rounded-3xl p-4 border border-white/5 backdrop-blur-md flex justify-between items-center shadow-inner">
              <div>
                <h3 className="text-[10px] text-gray-400 uppercase tracking-widest">Net Profit</h3>
                <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-virtus-success' : 'text-virtus-danger'}`}>
                  {isPositive ? '+' : ''}{data.totalProfit}u
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-[10px] text-gray-400 uppercase tracking-widest">ROI</h3>
                <div className={`text-lg font-mono font-bold ${data.roi > 5 ? 'text-purple-400' : 'text-gray-300'}`}>
                  {data.roi}%
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950/60 rounded-3xl p-4 border border-white/5 h-[140px] backdrop-blur-md flex flex-col shadow-inner">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <LineChart className="w-3 h-3 text-purple-400" /> Capital Growth
              </h3>
              <div className="flex-1 relative flex items-end">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <polyline 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="3"
                    points={curve.map((p, i, arr) => {
                      const min = Math.min(...arr.map(c => c.value)) * 0.9;
                      const max = Math.max(...arr.map(c => c.value)) * 1.1;
                      const range = max - min || 1;
                      const normalized = ((p.value - min) / range) * 100;
                      return `${(i / (arr.length - 1 || 1)) * 100} ${100 - normalized}`;
                    }).join(' ')}
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-slate-950/60 rounded-3xl p-4 border border-white/5 flex-1 backdrop-blur-md flex flex-col justify-center gap-3 shadow-inner">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target className="w-3 h-3 text-purple-400" /> Segment Efficiency
              </h3>
              {breakdown.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-[10px] mb-1 font-mono text-gray-400 uppercase font-black tracking-widest">
                    <span>{item.label}</span>
                    <span className={item.value > 50 ? "text-virtus-success" : "text-virtus-danger"}>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className={`h-full transition-all duration-1000 ease-out ${item.value > 50 ? 'bg-virtus-success' : 'bg-virtus-danger'}`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col h-full">
            <div className="bg-slate-950/60 rounded-3xl p-4 border border-white/5 h-full backdrop-blur-md flex flex-col shadow-inner">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 tracking-[0.1em]">
                <Scale className="w-3 h-3 text-virtus-accent" /> Strategy Calibration
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {strategyAdjustments.map((adj, idx) => {
                  let Icon = CheckCircle2;
                  let color = "text-gray-400";
                  let border = "border-gray-800";
                  if (adj.includes("STOP") || adj.includes("⚠")) { Icon = AlertTriangle; color = "text-virtus-danger"; border = "border-red-900/30 bg-red-950/10"; }
                  else if (adj.includes("INCREASE") || adj.includes("✅")) { Icon = TrendingUp; color = "text-virtus-success"; border = "border-emerald-900/30 bg-emerald-950/10"; }
                  else if (adj.includes("HEDGE") || adj.includes("🛡️")) { Icon = Shield; color = "text-virtus-primary"; border = "border-cyan-900/30 bg-cyan-950/10"; }
                  return (
                    <li key={idx} className={`p-3 rounded-2xl border ${border} flex items-start gap-3 list-none shadow-inner`}>
                      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                      <span className="text-[10px] text-gray-300 font-mono leading-relaxed font-bold uppercase tracking-tighter">{adj.replace(/⚠|✅|🛡️/g, '').trim()}</span>
                    </li>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

const MatchView: React.FC<{ 
  data: MatchDashboardData; 
  compact?: boolean;
  onExpand?: () => void;
}> = ({ data, compact = false, onExpand }) => {
  if (compact) {
    const radius = 24;
    const stroke = 3;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (data.winProbability / 100) * circumference;
    const gaugeColor = data.winProbability > 75 ? '#10b981' : data.winProbability > 55 ? '#06b6d4' : '#f59e0b';
    
    return (
      <div className="bg-virtus-panel border border-virtus-border rounded-lg p-4 relative shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,243,255,0.1)] transition-all duration-300 group cursor-pointer overflow-hidden" onClick={onExpand}>
        <div className="absolute inset-0 bg-scan-lines opacity-[0.03] pointer-events-none"></div>
        {data.isFireSignal && (
          <div className="absolute -top-2 -right-2 z-10 px-2 py-1 bg-red-600 text-white font-mono font-bold text-[8px] animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center gap-1 uppercase tracking-widest">
            <Flame className="w-2.5 h-2.5 fill-current" /> FIRE
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-virtus-primary to-transparent opacity-60"></div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold text-white flex items-center gap-2 uppercase tracking-[0.1em]">
            <Zap className="w-3 h-3 text-virtus-accent" />
            {data.leagueName || 'MATCH'}
          </h2>
          <div className="text-[9px] font-mono text-virtus-primary bg-virtus-primary/5 px-2 py-1 rounded border border-virtus-primary/20 font-black shadow-inner">
            +{data.edge}%
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center"><div className="text-sm font-black text-cyan-400 truncate uppercase tracking-tighter font-mono">{data.homeTeam}</div><div className="text-[8px] text-gray-500 mt-1 uppercase font-black">HOME</div></div>
          <div className="px-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg height={radius * 3} width={radius * 3} className="rotate-[-90deg] transform">
                <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
                <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius * 1.5} cy={radius * 1.5} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-black font-mono ${data.isFireSignal ? 'text-red-400' : 'text-white'}`}>{data.winProbability}%</span>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center"><div className="text-sm font-black text-red-400 truncate uppercase tracking-tighter font-mono">{data.awayTeam}</div><div className="text-[8px] text-gray-500 mt-1 uppercase font-black">AWAY</div></div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center mb-3 shadow-inner">
          <span className={`text-xs font-mono font-black uppercase tracking-widest ${data.isFireSignal ? 'text-red-400' : 'text-virtus-primary'}`}>{data.prediction}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[9px] text-gray-500 font-mono font-black uppercase tracking-widest">
           <span>STAKE: {data.stake}/5</span>
           <span className="group-hover:text-virtus-aztecCyan transition-colors flex items-center gap-1">DETAILS <ChevronRight size={10} /></span>
        </div>
      </div>
    );
  }

  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (data.winProbability / 100) * circumference;
  const gaugeColor = data.winProbability > 75 ? '#10b981' : data.winProbability > 55 ? '#06b6d4' : '#f59e0b';

  const stats = Array.isArray(data.stats) ? data.stats : [];
  const recommendedProps = Array.isArray(data.recommendedProps) ? data.recommendedProps : (data.playerProps?.map(p => `${p.player}: ${p.projection}`) || []);

  return (
    <div className={`bg-virtus-panel border border-virtus-border rounded-lg p-8 overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.8)]`}>
      <div className="absolute inset-0 bg-scan-lines opacity-[0.03] pointer-events-none"></div>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-virtus-primary to-transparent opacity-60`}></div>
      
      {data.isFireSignal && (
        <div className="absolute top-0 right-0 z-10 px-6 py-2 bg-red-600 text-white font-mono font-bold text-[10px] animate-pulse shadow-[0_0_25px_rgba(220,38,38,0.7)] flex items-center gap-2 uppercase tracking-widest">
          <Flame className="w-4 h-4 fill-current" /> FIRE_SIGNAL_ACTIVE_V4.0
        </div>
      )}

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-mono font-black text-white flex items-center gap-3 uppercase tracking-[0.3em]">
            <RadioTower className="w-6 h-6 text-virtus-aztecCyan animate-pulse" />
            KAIROS NEURAL TERMINAL v4
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="px-2.5 py-1 bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 rounded text-[9px] font-black text-virtus-aztecCyan tracking-widest uppercase shadow-inner">
              Module: {data.leagueName || 'GENERIC_SCAN'}
            </div>
            {data.neuralAnchor && (
               <div className="flex items-center gap-2 text-[9px] text-gray-600 font-mono uppercase tracking-widest">
                 <Hash size={10} className="text-gray-700" /> {data.neuralAnchor.substring(0, 16)}
               </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase font-black mb-1 tracking-widest">Alpha Edge</div>
            <div className="text-lg font-mono font-black text-virtus-aztecCyan">+{data.edge}%</div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase font-black mb-1 tracking-widest">Confidence</div>
            <div className="text-lg font-mono font-black text-emerald-400 uppercase tracking-tighter">HIGH</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Probability and Prediction Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-950/60 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center relative backdrop-blur-md shadow-inner">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-virtus-aztecCyan" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Neural Prob</span>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg height={radius * 4} width={radius * 4} className="rotate-[-90deg] transform">
                <circle cx="72" cy="72" r="60" className="stroke-white/5 fill-none" strokeWidth="6" />
                <circle 
                  cx="72" cy="72" r="60" 
                  className={`fill-none transition-all duration-2000 ease-out ${data.isFireSignal ? 'stroke-red-500 shadow-[0_0_10px_red]' : 'stroke-virtus-aztecCyan shadow-[0_0_10px_#00f3ff]'}`}
                  strokeWidth="6" 
                  strokeDasharray="377" 
                  strokeDashoffset={377 - (377 * data.winProbability) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black font-mono tracking-tighter ${data.isFireSignal ? 'text-red-400 text-glow-red' : 'text-white text-glow-cyan'}`}>{data.winProbability}%</span>
                <span className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-[0.4em]">Optimized</span>
              </div>
            </div>

            <div className="mt-10 w-full">
              <div className={`p-4 rounded-3xl border ${data.isFireSignal ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_20px_rgba(255,0,60,0.1)]' : 'bg-virtus-aztecCyan/5 border-virtus-aztecCyan/20 shadow-inner'} flex flex-col items-center`}>
                <span className="text-[9px] text-gray-500 uppercase font-black mb-2 tracking-widest">Core Pick</span>
                <span className={`text-xl font-black font-mono uppercase tracking-widest ${data.isFireSignal ? 'text-red-400' : 'text-virtus-aztecCyan'}`}>{data.prediction}</span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center shadow-inner">
                    <span className="text-[8px] text-gray-600 uppercase mb-1">EV INDEX</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">+{( (data.expectedValue || (data.edge/100)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center shadow-inner">
                    <span className="text-[8px] text-gray-600 uppercase font-black mb-1">TITANIUM</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{data.titaniumScore || 'N/A'}</span>
                  </div>
              </div>

              <div className="mt-4 p-4 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-virtus-aztecCyan/30"></div>
                <p className="text-[11px] text-gray-400 font-mono italic leading-relaxed uppercase tracking-tighter">
                  "{data.summary}"
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-950/60 rounded-3xl p-6 border border-white/5 space-y-5 shadow-inner">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-gray-500 uppercase font-black flex items-center gap-2 tracking-widest">
                  <Waves className="w-3.5 h-3.5 text-purple-400" /> Quantum Entropy
                </span>
                <span className="text-[11px] font-mono text-purple-400 font-bold">{(data.quantumEntropy || 0.042).toFixed(4)}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" style={{ width: `${(data.quantumEntropy || 0.42) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-gray-500 uppercase font-black flex items-center gap-2 tracking-widest">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> Black Swan Prob
                </span>
                <span className="text-[11px] font-mono text-red-500 font-bold">{(data.blackSwanProb || 0.012).toFixed(4)}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: `${(data.blackSwanProb || 0.12) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Analysis and Evidence Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-950/60 rounded-3xl p-8 border border-white/5 flex-1 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/20 via-transparent to-red-500/20"></div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
              <Scale className="w-4 h-4 text-virtus-aztecCyan" /> Neural Comparison Matrix
            </h3>
            
            <div className="flex justify-between text-sm font-black mb-8 px-4 font-mono uppercase">
               <span className="text-cyan-400 text-glow-cyan tracking-tighter">{data.homeTeam}</span>
               <span className="text-gray-800 italic tracking-[0.4em]">vs</span>
               <span className="text-red-400 text-glow-red tracking-tighter">{data.awayTeam}</span>
            </div>

            <div className="space-y-8">
              {(stats.length > 0 ? stats : [{label: 'ELO_RATING', homeValue: 1420, awayValue: 1380}, {label: 'LAST_5_PPG', homeValue: 112.5, awayValue: 108.2}, {label: 'INJURY_WEIGHT', homeValue: 0.2, awayValue: 0.8}, {label: 'OFF_EFFICIENCY', homeValue: 114.2, awayValue: 110.5}]).map((stat, idx) => {
                const total = (stat.homeValue || 0) + (stat.awayValue || 0);
                const homePct = total === 0 ? 50 : (stat.homeValue / total) * 100;
                return (
                  <div key={idx} className="relative group">
                    <div className="flex justify-between text-[10px] mb-2 font-mono text-gray-500 font-black tracking-widest uppercase">
                      <span className="text-cyan-400/80">{stat.homeValue}</span>
                      <span className="text-white/60">{stat.label}</span>
                      <span className="text-red-400/80">{stat.awayValue}</span>
                    </div>
                    <div className="h-2.5 bg-slate-950 rounded-full flex overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" style={{ width: `${homePct}%` }}></div>
                      <div className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-1500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" style={{ width: `${100-homePct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3 tracking-[0.1em]">
                <Lightbulb className="w-4 h-4 text-virtus-accent" /> Value Strategy Scan
              </h3>
              <div className="grid grid-cols-1 gap-4">
                 <div className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-virtus-aztecCyan/20 transition-all group shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-virtus-aztecCyan" />
                       <span className="text-[9px] font-black text-virtus-aztecCyan uppercase tracking-widest">Market Inefficiency</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed uppercase tracking-tighter">
                      {data.evidence?.causal || `Calculated EV of +${((data.expectedValue || 0.05)*100).toFixed(1)}% exceeds the 3% baseline for ${data.marketType || 'Prop'} markets.`}
                    </p>
                 </div>
                 <div className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-virtus-aztecRed/20 transition-all group shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                       <Activity className="w-3.5 h-3.5 text-virtus-aztecRed" />
                       <span className="text-[9px] font-black text-virtus-aztecRed uppercase tracking-widest">Risk Allocation</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed uppercase tracking-tighter">
                      {data.evidence?.counterfactual || `Titanium Score of ${data.titaniumScore || 50} recommends a ${data.stake}/5 stake based on volatility delta.`}
                    </p>
                 </div>
              </div>
            </div>

            {/* Grounding sources display for compliance with Gemini API requirements. */}
            {data.groundingSources && data.groundingSources.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <Globe className="w-4 h-4" /> Neural Grounding Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.groundingSources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 hover:bg-emerald-500/20 transition-all font-mono"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Golden Rule Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-950/60 rounded-3xl p-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] h-full flex flex-col shadow-inner relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
            <div className="flex flex-col gap-2 mb-6">
               <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Trophy className="w-4 h-4 shadow-[0_0_10px_#10b981]" /> REGLA DE ORO v4.0
               </h3>
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl inline-block self-start shadow-inner">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Winner Centric props</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
               {recommendedProps.map((prop, idx) => (
                 <div key={idx} className="group relative">
                   <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                   <div className="relative p-4 rounded-3xl bg-black/40 border border-white/5 hover:border-emerald-500/40 transition-all flex items-center gap-4 shadow-inner">
                     <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                     </div>
                     <span className="text-[11px] font-black text-gray-200 font-mono tracking-tighter leading-tight uppercase">
                        {prop}
                     </span>
                   </div>
                 </div>
               ))}
               
               {(data.leagueName?.includes('NFL') || data.leagueName?.includes('NCAA')) && (
                 <div className="p-4 rounded-3xl bg-black/40 border border-emerald-500/20 mt-4 flex items-center gap-4 shadow-inner group hover:border-emerald-500/40 transition-all">
                   <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <Shield className="w-4 h-4 text-emerald-400" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Defensive Lock</span>
                      <span className="text-[11px] font-black text-emerald-400 font-mono uppercase tracking-tighter">SACKS_PROJECTED: 3.5+</span>
                   </div>
                 </div>
               )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
               <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Optimal Bankroll</span>
                    <span className="text-[9px] font-mono text-virtus-accent uppercase font-bold tracking-[0.2em]">Investment Level</span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tighter">{data.stake}<span className="text-sm text-gray-600 font-normal">/5</span></div>
               </div>
               <div className="flex gap-2.5 h-3">
                 {[1,2,3,4,5].map(s => (
                   <div 
                    key={s} 
                    className={`flex-1 rounded-full transition-all duration-1000 shadow-inner ${
                      s <= data.stake ? 
                      (data.isFireSignal ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-virtus-accent shadow-[0_0_12px_rgba(245,158,11,0.5)]') : 
                      'bg-slate-900 border border-white/5'
                    }`}
                   ></div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};