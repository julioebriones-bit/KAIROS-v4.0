
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ksm } from '../stateManager';
import { PulseEvent, ModuleType, SystemState } from '../types';
import { 
  Zap, Activity, Clock, RefreshCw, Filter, 
  Settings2, Trash2, AlertTriangle, AlertCircle, 
  CheckCircle, Info, RadioTower, Waves, Cpu,
  Sparkles, Eye, EyeOff, Volume2, VolumeX,
  Maximize2, Minimize2
} from 'lucide-react';

interface LivePulseProps {
  autoRefresh?: boolean;
  maxHeight?: number;
  onEventClick?: (event: PulseEvent) => void;
  showHeader?: boolean;
}

const getSeverityStyles = (severity: string) => {
  switch(severity) {
    case 'critical':
      return { 
        border: 'border-l-red-500', 
        icon: 'text-red-500', 
        bg: 'bg-gradient-to-r from-red-950/30 to-transparent',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        iconComp: <AlertTriangle className="w-3.5 h-3.5" />
      };
    case 'high': 
      return { 
        border: 'border-l-virtus-aztecRed', 
        icon: 'text-virtus-aztecRed', 
        bg: 'bg-gradient-to-r from-red-950/20 to-transparent',
        glow: 'shadow-[0_0_10px_rgba(255,0,60,0.2)]',
        iconComp: <AlertCircle className="w-3.5 h-3.5" />
      };
    case 'medium': 
      return { 
        border: 'border-l-virtus-accent', 
        icon: 'text-virtus-accent', 
        bg: 'bg-gradient-to-r from-amber-950/20 to-transparent',
        glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        iconComp: <AlertCircle className="w-3.5 h-3.5" />
      };
    default: 
      return { 
        border: 'border-l-virtus-aztecCyan', 
        icon: 'text-virtus-aztecCyan', 
        bg: 'bg-gradient-to-r from-cyan-950/10 to-transparent',
        glow: 'shadow-[0_0_5px_rgba(0,243,255,0.1)]',
        iconComp: <Info className="w-3.5 h-3.5" />
      };
  }
};

const getSportIcon = (sport: string) => {
  const s = sport.toUpperCase();
  if (s.includes('NBA')) return '🏀';
  if (s.includes('NFL')) return '🏈';
  if (s.includes('MLB') || s.includes('LMB')) return '⚾';
  if (s.includes('SOCCER')) return '⚽';
  if (s.includes('NCAA')) return '🎓';
  if (s.includes('TENNIS')) return '🎾';
  if (s.includes('F1')) return '🏎️';
  if (s.includes('SYSTEM')) return '⚡';
  return '📊';
};

const PulseItem: React.FC<{ 
  event: PulseEvent;
  onClick?: (event: PulseEvent) => void;
}> = ({ event, onClick }) => {
  const styles = getSeverityStyles(event.severity);
  const timeAgo = useMemo(() => {
    const diff = Date.now() - event.timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, [event.timestamp]);

  return (
    <div 
      onClick={() => onClick && onClick(event)}
      className={`
        p-3 border-l-2 rounded-r-lg ${styles.border} ${styles.bg} ${styles.glow} 
        border-y border-r border-white/5 transition-all 
        hover:bg-white/5 hover:scale-[1.01] active:scale-[0.99]
        group relative overflow-hidden cursor-pointer
        animate-in slide-in-from-right duration-300
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${styles.icon} bg-black/20`}>
            {styles.iconComp}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-gray-300 tracking-wider flex items-center gap-1">
              <span className="text-xs">{getSportIcon(event.sport)}</span>
              {event.sport}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-gray-500 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo}
          </span>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 font-mono leading-tight relative z-10 pr-4">
        {event.message}
      </p>
      
      <div className={`absolute top-3 right-3 w-1 h-1 rounded-full ${styles.icon} ${event.severity === 'critical' ? 'animate-ping' : ''}`}></div>
    </div>
  );
};

export const LivePulse: React.FC<LivePulseProps> = ({ 
  autoRefresh = true, 
  maxHeight = 600,
  onEventClick,
  showHeader = true 
}) => {
  const [pulseData, setPulseData] = useState<PulseEvent[]>([]);
  const [systemState, setSystemState] = useState<SystemState>(SystemState.STANDBY);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    setPulseData([...ksm.getActivityLog()]);
    setSystemState(ksm.getSystemState());

    const handleUpdate = () => {
      setPulseData([...ksm.getActivityLog()]);
      setSystemState(ksm.getSystemState());
    };

    window.addEventListener('kairos-state-update', handleUpdate);
    return () => window.removeEventListener('kairos-state-update', handleUpdate);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPulseData([...ksm.getActivityLog()]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div 
      className={`
        flex flex-col h-full overflow-hidden 
        bg-black/20 border border-white/5 rounded-2xl
        ${expanded ? 'fixed inset-10 z-50' : ''}
        transition-all duration-500 shadow-2xl
      `}
      style={{ maxHeight: expanded ? 'none' : maxHeight }}
    >
      {showHeader && (
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <RadioTower className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural_Telemetry_V8</h3>
              <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mt-0.5">Live Process Stream</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className={`p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {pulseData.length > 0 ? (
          pulseData.map(ev => (
            <PulseItem key={ev.id} event={ev} onClick={onEventClick} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <Activity size={40} className="mb-4 text-gray-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Link...</span>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${systemState === SystemState.ANALYSIS_ACTIVE ? 'bg-virtus-aztecCyan animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{systemState}</span>
        </div>
        <span className="text-[8px] font-mono text-gray-600">EVENTS: {pulseData.length}</span>
      </div>
    </div>
  );
};
