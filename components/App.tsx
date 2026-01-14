
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TerminalOutput } from './components/TerminalOutput';
import { ModuleSelector } from './components/ModuleSelector';
import { HistoryModal } from './components/HistoryModal';
import { Toolbar } from './components/Toolbar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { SignalCard } from './components/SignalCard';
import { Sidebar } from './components/Sidebar';
import { LivePulse } from './components/LivePulse';
import { MonteCarloEngine } from './components/MonteCarloEngine';
import { NeuralDebateOverlay } from './components/NeuralDebateOverlay';
import { LiveNeuralScout } from './components/LiveNeuralScout';
import { createAnalysisSession } from './services/geminiService';
import { fetchTickets, fetchRules, fetchGlobalIntelligence, fetchGlobalSummary } from './supabaseClient';
import { ksm } from './stateManager';
import { 
  SystemState, 
  AnalysisMessage, 
  ModuleType, 
  BetTicket, 
  GlobalIntelligence, 
  GlobalSummary, 
  GovernanceMetrics,
  AgentType,
  DashboardData,
  MatchDashboardData
} from './types';
import { 
  BarChart3, 
  Terminal as TerminalIcon, 
  Zap,
  History as HistoryIcon,
  Sparkles,
  ChevronLeft,
  Radio,
  Cpu,
  Globe
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SystemState>(SystemState.STANDBY);
  const [view, setView] = useState<'SIGNALS' | 'TERMINAL' | 'PULSE'>('SIGNALS');
  const [messages, setMessages] = useState<AnalysisMessage[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.NONE);
  const [activeSignals, setActiveSignals] = useState<DashboardData[]>([]);
  const [expandedSignal, setExpandedSignal] = useState<DashboardData | null>(null);
  const [simulationSignal, setSimulationSignal] = useState<MatchDashboardData | null>(null);
  const [debateSignal, setDebateSignal] = useState<MatchDashboardData | null>(null);
  const [isLiveLinkOpen, setIsLiveLinkOpen] = useState(false);
  const [ticketHistory, setTicketHistory] = useState<BetTicket[]>([]);
  const [learnedRules, setLearnedRules] = useState<string[]>([]);
  const [globalIntel, setGlobalIntel] = useState<GlobalIntelligence[]>([]);
  const [globalSummary, setGlobalSummary] = useState<GlobalSummary | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  
  const [govMetrics] = useState<GovernanceMetrics>({
    reputationScore: 1240,
    votingPower: 35,
    totalProposals: 14,
    consensusStrength: 0.92
  });

  const [systemStats, setSystemStats] = useState({
    totalTickets: 0,
    fireSignals: 0,
    pendingAnalysis: 0,
    uptime: 0
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initializeKairos();
    
    const unsubscribe = ksm.subscribe(() => {
      setTicketHistory(ksm.getHistory());
      const stats = ksm.getStats();
      setSystemStats({
        totalTickets: stats.totalTickets,
        fireSignals: stats.fireSignals,
        pendingAnalysis: stats.queueLength,
        uptime: stats.lastSynced ? Math.floor((Date.now() - stats.lastSynced) / 1000) : 0
      });
      setState(ksm.getSystemState());
    });
    
    return () => unsubscribe();
  }, []);

  const initializeKairos = async () => {
    ksm.logActivity('SYSTEM', '🚀 Sincronizando Ciclo de Automatización v8.5...', 'medium');
    try {
        setIsSyncing(true);
        const [cloudTickets, intel, summary, rules] = await Promise.all([
            fetchTickets(ModuleType.NONE),
            fetchGlobalIntelligence(),
            fetchGlobalSummary(),
            fetchRules()
        ]);
        
        if (cloudTickets.length > 0) {
            cloudTickets.forEach(t => ksm.updateTicket(t));
        }
        
        setGlobalIntel(intel);
        setGlobalSummary(summary);
        setLearnedRules(rules);
        setLastSyncTime(new Date());

        const mockBacktest: DashboardData = {
          type: 'BACKTEST',
          id: 'bt-1',
          period: 'OCT 2024 - MAR 2025',
          winRate: 64.2,
          totalBets: 142,
          totalProfit: 42.5,
          roi: 12.8,
          curve: [{value: 0}, {value: 5}, {value: 3}, {value: 8}, {value: 12}, {value: 15}],
          breakdown: [{label: 'NBA', value: 68}, {label: 'NCAA', value: 61}, {label: 'LMB', value: 58}],
          strategyAdjustments: ['✅ INCREASE STAKE ON HOME DOGS', '🛡️ HEDGE LATE NBA SPREADS', '⚠ STOP OVERAL ON LMB DOUBLEHEADS'],
          timestamp: Date.now()
        };
        setActiveSignals([mockBacktest]);

    } catch (e) { 
        console.error("Init Error", e); 
    } finally { 
        setIsSyncing(false); 
    }
  };

  const handleModuleSelect = async (module: ModuleType) => {
    if (state !== SystemState.STANDBY && state !== SystemState.ANALYSIS_READY) return;
    ksm.setCurrentSport(module);
    setState(SystemState.NEURAL_GROUNDING);
    setActiveModule(module);
    
    setMessages(prev => [...prev, { 
      id: `grounding-${Date.now()}`, 
      role: 'model', 
      text: `⚡ DEEP_WEB_SCAN ::: INICIANDO NEURAL GROUNDING [${module}]...`, 
      createdAt: Date.now(), 
      agent: AgentType.SYSTEM 
    }]);
    
    try {
        setState(SystemState.ANALYSIS_ACTIVE);
        const matches = await createAnalysisSession(module, learnedRules, globalIntel);
        
        if (matches.length > 0) {
            setDebateSignal(matches[0]);
            setState(SystemState.QUANTUM_COLLAPSE);
            
            setMessages(prev => [...prev, { 
              id: `res-${Date.now()}`, 
              role: 'model', 
              text: `Deep Intelligence scan completed for ${module}. Grounding citations added.`, 
              createdAt: Date.now(), 
              agent: AgentType.META 
            }]);
            
            (window as any).__pendingSignals = matches;
        } else {
            setState(SystemState.STANDBY);
        }
    } catch(e) { 
        ksm.logActivity(module, 'Neural Grounding failed: Deep Web connection timed out.', 'high');
        setState(SystemState.STANDBY);
    }
  };

  const confirmDebate = async () => {
    const pending = (window as any).__pendingSignals as MatchDashboardData[];
    if (pending) {
      setActiveSignals(prev => [...pending, ...prev]);
      await ksm.addSignals(pending, activeModule);
    }
    setDebateSignal(null);
    setState(SystemState.STANDBY);
    setView('SIGNALS');
  };

  const toggleLiveLink = () => {
    if (!isLiveLinkOpen) {
      setState(SystemState.LIVE_LINK);
      setIsLiveLinkOpen(true);
    } else {
      setState(SystemState.STANDBY);
      setIsLiveLinkOpen(false);
    }
  };

  const renderMainView = () => {
    if (expandedSignal) {
      return (
        <div className="p-6 max-w-7xl mx-auto w-full animate-in slide-in-from-left duration-300">
          <button 
            onClick={() => setExpandedSignal(null)}
            className="mb-6 flex items-center gap-2 text-virtus-aztecCyan text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> Volver al Dashboard
          </button>
          <AnalyticsPanel data={expandedSignal} />
        </div>
      );
    }

    switch(view) {
        case 'SIGNALS':
            return (
                <div className="p-6 space-y-8 max-w-7xl mx-auto w-full pb-24">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-700 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Grounding v8.5 Active</span>
                          <p className="text-[10px] text-gray-400 font-mono italic">Regla de Oro (28-Sep) Compliance: Bilateral validation enforced.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">REAL_TIME_SCAN</span>
                      </div>
                    </div>

                    <ModuleSelector onSelect={handleModuleSelect} disabled={state !== SystemState.STANDBY && state !== SystemState.ANALYSIS_READY} currentModule={activeModule} />
                    
                    {state === SystemState.SCANNING || state === SystemState.ANALYSIS_ACTIVE || state === SystemState.NEURAL_GROUNDING ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-virtus-aztecCyan border border-virtus-aztecCyan/20 bg-virtus-aztecCyan/5 rounded-3xl animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
                            <Cpu className="w-12 h-12 mb-6 text-virtus-aztecCyan animate-spin-slow" />
                            <span className="text-sm font-mono font-black uppercase tracking-[1em] mb-2">{state === SystemState.NEURAL_GROUNDING ? 'Neural_Grounding...' : 'Deep_Market_Pulse...'}</span>
                            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-virtus-aztecCyan animate-progress"></div>
                            </div>
                        </div>
                    ) : activeSignals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700">
                            {activeSignals.map((s, i) => (
                              s.type === 'MATCH' ? (
                                <SignalCard 
                                  key={s.id || i} 
                                  signal={s as MatchDashboardData} 
                                  compact 
                                  onExpand={() => setExpandedSignal(s)} 
                                  onSimulate={(sig) => setSimulationSignal(sig)}
                                />
                              ) : (
                                <AnalyticsPanel 
                                  key={s.id || i} 
                                  data={s} 
                                  compact 
                                  onExpand={() => setExpandedSignal(s)} 
                                />
                              )
                            ))}
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-700 border border-white/5 bg-black/30 rounded-3xl border-dashed">
                            <Sparkles className="w-16 h-16 opacity-10 text-virtus-aztecCyan mb-6" />
                            <span className="text-[12px] font-mono uppercase tracking-[1em] font-black text-white/10">KAIROS_V8.5_READY</span>
                        </div>
                    )}
                </div>
            );
        case 'TERMINAL':
            return (
                <div className="h-full flex flex-col overflow-hidden bg-black/20">
                    <TerminalOutput 
                      messages={messages} 
                      isThinking={state === SystemState.ANALYSIS_ACTIVE} 
                      onClear={() => setMessages([])}
                    />
                </div>
            );
        case 'PULSE': return <LivePulse />;
        default: return null;
    }
  };

  return (
    <div className="h-screen bg-virtus-bg text-gray-200 flex flex-col font-sans overflow-hidden select-none">
      <Header 
        state={state} 
        onReset={() => window.location.reload()} 
        isAutoPilot={isAutoPilot} 
        onToggleAutoPilot={() => setIsAutoPilot(!isAutoPilot)} 
        apiUsage={systemStats.fireSignals} 
        lastSync={lastSyncTime} 
        isSyncing={isSyncing} 
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onShowHistory={() => setShowHistoryModal(true)} onSync={initializeKairos} />
        <main className="flex-1 flex flex-col min-w-0 bg-virtus-bg relative">
            <div className="bg-black/80 border-b border-virtus-aztecCyan/10 flex px-6 backdrop-blur-xl z-10">
                <button onClick={() => { setView('SIGNALS'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'SIGNALS' ? 'text-white' : 'text-gray-500'}`}>
                    <BarChart3 className="w-4 h-4" /> Orbital Dashboard
                    {view === 'SIGNALS' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecCyan shadow-[0_0_10px_#00f3ff]"></div>}
                </button>
                <button onClick={() => { setView('TERMINAL'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'TERMINAL' ? 'text-white' : 'text-gray-500'}`}>
                    <TerminalIcon className="w-4 h-4" /> Deep Console
                    {view === 'TERMINAL' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecRed shadow-[0_0_10px_#ff003c]"></div>}
                </button>
                <button onClick={() => { setView('PULSE'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'PULSE' ? 'text-white' : 'text-gray-500'}`}>
                    <Zap className="w-4 h-4" /> Live Nerve
                    {view === 'PULSE' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 shadow-[0_0_10px_#ffd700]"></div>}
                </button>
                <div className="flex-1"></div>
                <button 
                  onClick={toggleLiveLink}
                  className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${state === SystemState.LIVE_LINK ? 'text-virtus-aztecCyan' : 'text-gray-500 hover:text-white'}`}
                >
                    <Radio className={`w-4 h-4 ${state === SystemState.LIVE_LINK ? 'animate-pulse' : ''}`} /> Neural Link
                    {state === SystemState.LIVE_LINK && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecCyan shadow-[0_0_10px_#00f3ff]"></div>}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto z-10 custom-scrollbar">{renderMainView()}</div>
            <Toolbar metrics={govMetrics} state={state} systemStats={systemStats} onManualSync={initializeKairos} />
        </main>
      </div>
      {showHistoryModal && <HistoryModal tickets={ticketHistory} onClose={() => setShowHistoryModal(false)} onUpdateStatus={(id, s) => ksm.updateTicketStatus(id, s)} />}
      {simulationSignal && (
        <MonteCarloEngine 
          signal={simulationSignal} 
          onClose={() => setSimulationSignal(null)} 
        />
      )}
      {debateSignal && (
        <NeuralDebateOverlay 
          signal={debateSignal}
          onConfirm={confirmDebate}
        />
      )}
      {isLiveLinkOpen && (
        <LiveNeuralScout 
          onClose={() => {
            setIsLiveLinkOpen(false);
            setState(SystemState.STANDBY);
          }}
        />
      )}
    </div>
  );
};

export default App;
