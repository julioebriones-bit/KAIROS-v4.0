
import React, { useState, useEffect } from 'react';
import { 
  Award, Waves, Hammer, Target, Activity, 
  Cpu, Zap, Clock, TrendingUp,
  Server, RefreshCw, Settings, Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';
import { SystemState, GovernanceMetrics } from '../types';

interface ToolbarProps {
  metrics: GovernanceMetrics;
  state: SystemState;
  systemStats?: {
    totalTickets: number;
    fireSignals: number;
    pendingAnalysis: number;
    uptime?: number;
  };
  onManualSync?: () => void;
}

interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  info: string;
  color: string;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  metrics, 
  state,
  systemStats,
  onManualSync
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTooltips, setShowTooltips] = useState(false);
  const [muteAlerts, setMuteAlerts] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0d 0h';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };

  const handleSync = async () => {
    if (syncing || !onManualSync) return;
    setSyncing(true);
    try {
      await onManualSync();
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  const items: ToolbarItem[] = [
    {
      id: 'reputation',
      icon: <Award className="w-4 h-4" />,
      label: "Reputation Rank",
      value: metrics.reputationScore,
      info: "Precision score based on historical data.",
      color: 'text-virtus-aztecCyan',
      status: 'good'
    },
    {
      id: 'quantum',
      icon: <Waves className={`w-4 h-4 ${state === SystemState.QUANTUM_COLLAPSE ? 'animate-pulse' : ''}`} />,
      label: "Quantum Phase",
      value: state === SystemState.QUANTUM_COLLAPSE ? "Collapsing" : "Synchronized",
      info: "Probabilistic engine state.",
      color: state === SystemState.QUANTUM_COLLAPSE ? 'text-purple-400' : 'text-cyan-400',
      status: 'good'
    },
    {
      id: 'governance',
      icon: <Hammer className="w-4 h-4" />,
      label: "DAO Authority",
      value: `v8.3 Phoenix`,
      info: "Decentralized governance level.",
      color: 'text-virtus-aztecRed',
      status: 'good'
    },
    {
      id: 'consensus',
      icon: <Target className="w-4 h-4" />,
      label: "Consensus Edge",
      value: `${((metrics.consensusStrength || 0.92) * 100).toFixed(1)}%`,
      info: "Mathematical edge against market averages.",
      color: 'text-emerald-400',
      status: 'good'
    },
    {
      id: 'uptime',
      icon: <Server className="w-4 h-4" />,
      label: "System Uptime",
      value: formatUptime(systemStats?.uptime),
      info: "Continuous operation time of KAIROS v8.",
      color: 'text-gray-400',
      status: 'good'
    }
  ];

  return (
    <div className="h-14 bg-black/95 border-t border-virtus-aztecCyan/30 flex items-center px-6 gap-8 overflow-x-auto no-scrollbar backdrop-blur-xl relative z-50">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-virtus-aztecCyan to-transparent opacity-40"></div>
      
      <div className="flex items-center gap-3 shrink-0 border-r border-white/10 pr-6">
        <div className="relative">
          <Cpu className={`w-5 h-5 ${state === SystemState.ANALYSIS_ACTIVE ? 'text-virtus-aztecCyan animate-pulse' : 'text-emerald-400'}`} />
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${state === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan animate-ping' : 'bg-emerald-500'}`}></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-600 uppercase font-black leading-none tracking-widest">Core Engine</span>
          <span className="text-[10px] text-white font-mono font-bold leading-none mt-1.5 uppercase tracking-tighter">
            {state.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8 flex-1 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 group relative cursor-help shrink-0 transition-all duration-300">
            <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-virtus-aztecCyan/50 transition-colors`}>
              {item.icon}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-600 uppercase font-black leading-none tracking-widest">{item.label}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] font-mono font-bold leading-none tracking-tighter ${item.color}`}>{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">UTC_TIMESTAMP</span>
          <span className="text-[10px] text-gray-400 font-mono font-bold">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setMuteAlerts(!muteAlerts)} className={`p-1.5 rounded-lg border transition-all ${muteAlerts ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/10 text-gray-600 hover:text-white'}`}>
            {muteAlerts ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button onClick={handleSync} disabled={syncing} className={`p-1.5 rounded-lg border border-white/10 text-gray-600 hover:text-virtus-aztecCyan transition-all ${syncing ? 'animate-spin text-virtus-aztecCyan' : ''}`}>
            <RefreshCw size={14} />
          </button>
          <button className="p-1.5 rounded-lg border border-white/10 text-gray-600 hover:text-white transition-all">
            <Settings size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
