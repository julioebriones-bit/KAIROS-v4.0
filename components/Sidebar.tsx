
import React, { useState, useEffect, useMemo } from 'react';
import { ksm } from '../stateManager';
import { BetTicket, ModuleType, BetStatus, SystemState } from '../types';
import { 
  History, Flame, Globe, Target, 
  Zap, Trophy, Cpu, Activity,
  Clock, Sparkles, ChevronRight,
  Shield, RadioTower, Layers,
  Calendar, Database, Settings, Layout,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  onShowHistory: () => void;
  onSync: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onShowHistory, 
  onSync
}) => {
  const [tickets, setTickets] = useState<BetTicket[]>([]);
  const [currentSport, setCurrentSport] = useState<ModuleType>(ModuleType.NONE);
  const [systemState, setSystemState] = useState<SystemState>(SystemState.STANDBY);
  const [collapsed, setCollapsed] = useState(false);
  const [showOnlyFireSignals, setShowOnlyFireSignals] = useState(false);

  useEffect(() => {
    setTickets(ksm.getHistory());
    setCurrentSport(ksm.getCurrentSport());
    setSystemState(ksm.getSystemState());

    const handleUpdate = () => {
      setTickets([...ksm.getHistory()]);
      setCurrentSport(ksm.getCurrentSport());
      setSystemState(ksm.getSystemState());
    };
    window.addEventListener('kairos-state-update', handleUpdate);
    return () => window.removeEventListener('kairos-state-update', handleUpdate);
  }, []);

  const stats = useMemo(() => {
    let filtered = [...tickets];
    if (currentSport !== ModuleType.NONE) filtered = filtered.filter(t => t.module === currentSport);
    if (showOnlyFireSignals) filtered = filtered.filter(t => t.isFireSignal);
    
    return {
      total: filtered.length,
      won: filtered.filter(t => t.status === BetStatus.WON).length,
      lost: filtered.filter(t => t.status === BetStatus.LOST).length,
      fire: filtered.filter(t => t.isFireSignal).length
    };
  }, [tickets, currentSport, showOnlyFireSignals]);

  if (collapsed) {
    return (
      <aside className="w-16 bg-black border-r border-virtus-aztecCyan/20 flex flex-col items-center py-8 gap-10 shadow-2xl backdrop-blur-3xl relative z-30 transition-all duration-500">
        <button onClick={() => setCollapsed(false)} className="text-gray-500 hover:text-virtus-aztecCyan transition-colors">
          <ChevronRight size={20} />
        </button>
        <button onClick={() => {}} className="text-gray-500 hover:text-virtus-aztecCyan transition-all group">
          <Layout size={20} />
        </button>
        <button onClick={onSync} className="text-gray-500 hover:text-virtus-aztecCyan transition-all group">
          <Database size={20} />
        </button>
        <button onClick={onShowHistory} className="text-gray-500 hover:text-virtus-aztecCyan transition-all group">
          <History size={20} />
        </button>
        <div className="mt-auto mb-4">
          <div className="w-2 h-2 rounded-full bg-virtus-aztecCyan animate-pulse shadow-[0_0_8px_#00f3ff]"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-virtus-panel/95 border-r border-virtus-aztecCyan/20 flex flex-col shadow-2xl backdrop-blur-3xl relative z-30 transition-all duration-500">
      <button 
        onClick={() => setCollapsed(true)} 
        className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
      >
        <ChevronRight className="w-4 h-4 transform rotate-180" />
      </button>

      {/* Cycle Monitor Section */}
      <div className="p-6 bg-gradient-to-b from-black/60 to-transparent border-b border-virtus-aztecCyan/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-virtus-aztecCyan/10 rounded-lg border border-virtus-aztecCyan/30 shadow-inner">
            <Layers className="w-4 h-4 text-virtus-aztecCyan animate-pulse" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Neural Cycle v4.0</h2>
            <p className="text-[8px] text-gray-500 font-mono">AUTOMATED_DEEP_SCAN</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-virtus-aztecCyan/30 transition-colors group shadow-inner">
            <div className="flex items-center gap-3">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] text-gray-400 font-mono font-bold tracking-widest">Daily Scouting</span>
            </div>
            <span className="text-[8px] font-black text-emerald-400 group-hover:animate-pulse">SYNCHRONIZED</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5 hover:border-virtus-aztecRed/30 transition-colors group shadow-inner">
            <div className="flex items-center gap-3">
              <Shield className="w-3.5 h-3.5 text-virtus-aztecRed" />
              <span className="text-[9px] text-gray-400 font-mono font-bold tracking-widest">Risk Mitigation</span>
            </div>
            <span className="text-[8px] font-black text-virtus-aztecRed">ENABLED</span>
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-virtus-aztecCyan/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
              <Cpu className="w-5 h-5 text-virtus-aztecCyan relative z-10" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-white tracking-widest uppercase">KAIROS_V4_CORE</h3>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${systemState === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan animate-pulse shadow-[0_0_5px_#00f3ff]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                <span className="text-[8px] text-gray-500 font-mono">{systemState}</span>
              </div>
            </div>
          </div>
          <button onClick={onSync} className="p-2 hover:bg-virtus-aztecCyan/10 rounded-lg text-gray-400 hover:text-virtus-aztecCyan transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button 
            onClick={() => setShowOnlyFireSignals(!showOnlyFireSignals)} 
            className={`px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showOnlyFireSignals ? 'bg-virtus-aztecRed/20 border-virtus-aztecRed/40 text-virtus-aztecRed shadow-[0_0_15px_rgba(255,0,60,0.15)]' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}
          >
            <Flame className="w-3 h-3" /> Fire Only
          </button>
          <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 flex flex-col justify-center shadow-inner">
            <span className="text-[8px] text-gray-500 uppercase font-black">Accuracy</span>
            <span className="text-[11px] font-mono font-black text-emerald-400 tracking-tighter">68.5% <Activity className="inline w-2.5 h-2.5 ml-1" /></span>
          </div>
        </div>
      </div>

      {/* Real-time Feed Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <RadioTower className="w-3 h-3 text-virtus-aztecCyan" /> Neural Stream
          </div>
          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Live_Activity</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar pb-6">
          {tickets.length > 0 ? (
            tickets.slice(0, 15).map((ticket, i) => (
              <div 
                key={ticket.id} 
                className={`p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-virtus-aztecCyan/30 transition-all cursor-pointer group animate-in slide-in-from-right duration-500 shadow-inner`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-virtus-aztecCyan uppercase tracking-widest">{ticket.module}</span>
                    {ticket.isFireSignal && <Sparkles className="w-2.5 h-2.5 text-red-500 animate-pulse" />}
                  </div>
                  <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                    ticket.status === BetStatus.WON ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    ticket.status === BetStatus.LOST ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {ticket.status}
                  </div>
                </div>
                <div className="text-[11px] font-bold text-white group-hover:text-virtus-aztecCyan transition-colors truncate uppercase tracking-tighter font-mono">
                  {ticket.homeTeam} <span className="text-gray-600 mx-1">vs</span> {ticket.awayTeam}
                </div>
                <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{ticket.prediction}</span>
                  <span className="text-[9px] font-mono font-black text-emerald-400">+{ticket.edge}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <Zap className="w-8 h-8 mb-4 text-virtus-aztecCyan animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest">No Active Telemetry</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/10 bg-black/60">
        <button 
          onClick={onShowHistory} 
          className="w-full py-3.5 bg-gradient-to-r from-virtus-aztecCyan/10 to-transparent hover:from-virtus-aztecCyan/20 border border-virtus-aztecCyan/20 rounded-2xl text-[10px] font-black text-virtus-aztecCyan hover:text-white flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] group shadow-inner"
        >
          <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" /> Neural Audit Logs
        </button>
      </div>
    </aside>
  );
};
