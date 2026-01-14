
import React, { useState } from 'react';
import { MatchDashboardData } from '../types';
import { 
  Target, Zap, ShieldCheck, Flame, TrendingUp, 
  Brain, Activity, ChevronRight,
  Copy, Bookmark, CheckCircle, Dices, Lock, Shield,
  Clock, Hash, BarChart3, Globe, Rocket
} from 'lucide-react';

interface SignalCardProps {
  signal: MatchDashboardData;
  compact?: boolean;
  onExpand?: () => void;
  onBookmark?: () => void;
  onSimulate?: (signal: MatchDashboardData) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ 
  signal, 
  compact = false,
  onExpand,
  onBookmark,
  onSimulate
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isFire = signal.isFireSignal || signal.winProbability >= 85;
  const edgeColor = signal.edge >= 15 ? 'text-emerald-400' : 
                    signal.edge >= 10 ? 'text-virtus-aztecCyan' : 
                    'text-virtus-accent';
  
  const getSportIcon = () => {
    const league = signal.leagueName?.toLowerCase() || '';
    if (league.includes('nba')) return '🏀';
    if (league.includes('nfl')) return '🏈';
    if (league.includes('mlb') || league.includes('lmb')) return '⚾';
    if (league.includes('soccer')) return '⚽';
    if (league.includes('ncaa')) return '🎓';
    return '🎯';
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🔔 KAIROS v8.5 | DEEP WEB INTEL\n${signal.homeTeam} vs ${signal.awayTeam}\n📊 Prob: ${signal.winProbability}%\n🎯 Pick: ${signal.prediction}\n📈 EV: +${((signal.expectedValue || 0) * 100).toFixed(1)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  const handleSimulate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSimulate) onSimulate(signal);
  };

  if (compact) {
    return (
      <div 
        onClick={onExpand}
        className={`
          bg-gradient-to-br from-slate-900/80 to-black/80 border rounded-2xl p-5 
          relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer group
          ${isFire ? 'border-red-500/40 shadow-[0_0_25px_rgba(255,0,60,0.1)]' : 'border-virtus-aztecCyan/40 shadow-2xl'}
          hover:border-white/20
        `}
      >
        <div className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-10 group-hover:opacity-20 ${isFire ? 'bg-red-500' : 'bg-virtus-aztecCyan'}`}></div>
        
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isFire ? 'bg-red-500/10 border border-red-500/20' : 'bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/20'}`}>
              <span className="text-lg">{getSportIcon()}</span>
            </div>
            <div>
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{signal.leagueName || 'NEURAL_SCAN'}</div>
              <h3 className="text-sm font-black text-white truncate max-w-[140px] uppercase tracking-tight">
                {signal.homeTeam} <span className="text-gray-600">v</span> {signal.awayTeam}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-black font-mono leading-none ${isFire ? 'text-red-500' : 'text-virtus-aztecCyan'}`}>{signal.winProbability}%</div>
            <div className="text-[8px] text-gray-600 font-mono tracking-tighter mt-1 uppercase">WIN_PROB</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 shadow-inner">
            <div className="text-[8px] text-gray-600 uppercase mb-1 font-black">Investment</div>
            <div className="text-[11px] font-bold text-gray-200 truncate font-mono uppercase tracking-tighter">{signal.prediction}</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 shadow-inner flex flex-col justify-center">
            <div className="text-[8px] text-gray-600 uppercase mb-1 font-black">Titanium Score</div>
            <div className={`text-[11px] font-bold font-mono ${edgeColor}`}>
                {signal.titaniumScore || Math.round(signal.edge * 10)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between relative z-10 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            {signal.isNeuralGrounded && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20" title="Neural Grounding Active">
                <Globe className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[8px] font-mono text-emerald-400 uppercase font-black">GROUNDED</span>
              </div>
            )}
            <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-1">
              <Rocket className="w-2.5 h-2.5 text-indigo-400" />
              <span className="text-[8px] font-black text-indigo-400 uppercase">ORBITAL</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black uppercase tracking-widest group-hover:text-white transition-colors">
            Audit <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      bg-gradient-to-br from-black/90 to-slate-950/90 border rounded-3xl p-8 
      relative overflow-hidden transition-all group
      ${isFire ? 'neon-frame-red border-red-500/40 shadow-[0_0_60px_rgba(255,0,60,0.15)]' : 'neon-frame-cyan border-virtus-aztecCyan/40 shadow-[0_0_60px_rgba(0,243,255,0.1)]'}
    `}>
      <div className={`absolute -top-32 -right-32 w-64 h-64 blur-3xl rounded-full transition-opacity opacity-20 group-hover:opacity-30 ${isFire ? 'bg-red-500' : 'bg-virtus-aztecCyan'}`}></div>
      
      <div className="flex justify-between items-start mb-8 relative z-20">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isFire ? 'bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(255,0,60,0.2)]' : 'bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]'}`}>
            {getSportIcon()}
          </div>
          <div>
            <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1">{signal.leagueName || 'NEURAL_ORCHESTRATOR_V8.5'}</div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
              {signal.homeTeam} <span className="text-gray-700 mx-1 font-mono text-base font-normal">v</span> {signal.awayTeam}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {signal.isNeuralGrounded && (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Neural Grounding</span>
            </div>
          )}
          <button 
            onClick={handleSimulate} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 text-virtus-aztecCyan hover:bg-virtus-aztecCyan/20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <Dices className="w-4 h-4" /> Simulate
          </button>
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          <button onClick={handleBookmark} className={`p-2.5 rounded-xl border transition-all ${isBookmarked ? 'bg-virtus-accent/10 border-virtus-accent/30 text-virtus-accent' : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleCopy} className={`p-2.5 rounded-xl border transition-all ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`}>
            {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group/metric shadow-inner">
          <div className="absolute inset-0 bg-scan-lines opacity-[0.03] group-hover/metric:opacity-[0.06] transition-opacity"></div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Neural Probability</span>
          <div className={`text-6xl font-black font-mono tracking-tighter ${isFire ? 'text-red-500 text-glow-red' : 'text-virtus-aztecCyan text-glow-cyan'}`}>{signal.winProbability}%</div>
          <div className="flex gap-1.5 mt-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-6 h-1 rounded-full ${i <= Math.ceil(signal.winProbability/20) ? (isFire ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-virtus-aztecCyan shadow-[0_0_10px_#00f3ff]') : 'bg-gray-800'}`}></div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group/metric shadow-inner">
          <div className="absolute inset-0 bg-scan-lines opacity-[0.03] group-hover/metric:opacity-[0.06] transition-opacity"></div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Investment Edge (EV)</span>
          <div className={`text-6xl font-black font-mono tracking-tighter ${edgeColor}`}>+{( (signal.expectedValue || (signal.edge/100)) * 100).toFixed(1)}%</div>
          <div className="flex items-center gap-3 mt-6">
            <TrendingUp className={`w-5 h-5 ${edgeColor}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${edgeColor}`}>Deep Web Consensus</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-black/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between group/pick hover:border-virtus-aztecCyan/30 transition-all shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-virtus-aztecCyan/5 rounded-xl border border-virtus-aztecCyan/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-virtus-aztecCyan" />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Arbitrated Prediction</div>
              <div className="text-xl font-black text-white uppercase tracking-tight font-mono">{signal.prediction}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-1">ESTIMATED ODDS: {signal.marketOdds || '1.91'}</div>
            </div>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
             <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Bankroll Stake</div>
             <div className="text-2xl font-black text-white font-mono">{signal.stake}<span className="text-gray-700 text-sm font-normal">/5</span></div>
          </div>
        </div>

        {signal.summary && (
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 w-1 h-full bg-virtus-aztecCyan/20"></div>
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-virtus-aztecCyan/70" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deep Intelligence v8.5</span>
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed italic">
              "{signal.summary}"
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-700" />
            <span className="text-[11px] text-gray-600 font-mono uppercase tracking-widest">Scan_Latency: <span className="text-gray-400">42ms</span></span>
          </div>
          {signal.id && (
            <div className="flex items-center gap-2 border-l border-white/5 pl-6">
              <Hash className="w-4 h-4 text-virtus-aztecCyan/40" />
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">Vault_Hash: <span className="text-gray-400">{signal.id.substring(0, 16)}</span></span>
            </div>
          )}
        </div>
        <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${isFire ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,60,0.3)]' : 'bg-virtus-aztecCyan/5 border-virtus-aztecCyan/20 text-virtus-aztecCyan'}`}>
          {isFire ? 'CRITICAL_VALUE_SYNC' : 'FINANCIAL_INTEGRITY_STABLE'}
        </div>
      </div>
    </div>
  );
};
