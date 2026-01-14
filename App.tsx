
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
import { autonomousService } from './services/autonomousService';
import { systemHealthService } from './services/systemHealthService';
import { externalWorkflowService } from './services/externalWorkflowService';
import { lmbService } from './services/lmbService';
import { mlbService } from './services/mlbService';
import { nbaService } from './services/nbaService';
import { nflService } from './services/nflService';
import { soccerService } from './services/soccerService';
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
  MatchDashboardData,
  AutonomousLog,
  SystemHealthData,
  ExternalWorkflow
} from './types';
import { 
  BarChart3, 
  Terminal as TerminalIcon, 
  Zap,
  ChevronLeft,
  Radio,
  Cpu,
  Globe,
  Sparkles,
  Bot,
  RefreshCw,
  History as HistoryIcon,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Github,
  Calendar,
  Lock
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SystemState>(SystemState.STANDBY);
  const [view, setView] = useState<'SIGNALS' | 'TERMINAL' | 'PULSE' | 'AUTONOMOUS'>('SIGNALS');
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
  const [autonomousLogs, setAutonomousLogs] = useState<AutonomousLog[]>([]);
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [externalWorkflows, setExternalWorkflows] = useState<ExternalWorkflow[]>([]);
  
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
    
    const healthInterval = setInterval(refreshHealthAndWorkflows, 60000);
    
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
    
    return () => {
      unsubscribe();
      clearInterval(healthInterval);
    };
  }, []);

  const refreshHealthAndWorkflows = async () => {
    const [hData, wData] = await Promise.all([
      systemHealthService.fetchLatestHealth(),
      externalWorkflowService.fetchWorkflows()
    ]);
    if (hData) setHealthData(hData);
    if (wData) setExternalWorkflows(wData);
  };

  const initializeKairos = async () => {
    ksm.logActivity('SYSTEM', '🚀 Sincronizando Ciclo de Automatización v8.5...', 'medium');
    try {
        setIsSyncing(true);
        const [cloudTickets, intel, summary, rules, health, workflows] = await Promise.all([
            fetchTickets(ModuleType.NONE),
            fetchGlobalIntelligence(),
            fetchGlobalSummary(),
            fetchRules(),
            systemHealthService.fetchLatestHealth(),
            externalWorkflowService.fetchWorkflows()
        ]);
        
        if (cloudTickets.length > 0) {
            cloudTickets.forEach(t => ksm.updateTicket(t));
        }
        
        setGlobalIntel(intel);
        setGlobalSummary(summary);
        setLearnedRules(rules);
        setHealthData(health);
        setExternalWorkflows(workflows);
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

  const runAutonomousCycle = async () => {
    if (state !== SystemState.STANDBY) return;
    setState(SystemState.AUTONOMOUS_CYCLE);
    ksm.setSystemState(SystemState.AUTONOMOUS_CYCLE);
    setMessages(prev => [...prev, {
      id: `auto-${Date.now()}`,
      role: 'model',
      text: "⚡ PROTOCOLO_AUTÓNOMO_INICIADO ::: Ejecutando Post-Mortem y Scouting orbital...",
      createdAt: Date.now(),
      agent: AgentType.AUTONOMOUS
    }]);

    const log = await autonomousService.runCycle();
    setAutonomousLogs(prev => [log, ...prev]);
    setState(SystemState.STANDBY);
    ksm.setSystemState(SystemState.STANDBY);
    
    setMessages(prev => [...prev, {
      id: `auto-res-${Date.now()}`,
      role: 'model',
      text: `✅ CICLO_COMPLETADO. PM: ${log.post_mortem} | Scout: ${log.scouting}. ${log.errors.length > 0 ? `Alertas: ${log.errors.length}` : ''}`,
      createdAt: Date.now(),
      agent: AgentType.AUTONOMOUS
    }]);
    
    refreshHealthAndWorkflows();
  };

  const handleModuleSelect = async (module: ModuleType) => {
    if (state !== SystemState.STANDBY && state !== SystemState.ANALYSIS_READY) return;
    ksm.setCurrentSport(module);
    setState(SystemState.NEURAL_GROUNDING);
    setActiveModule(module);
    
    setMessages(prev => [...prev, { 
      id: `grounding-${Date.now()}`, 
      role: 'model', 
      text: `⚡ DEEP_WEB_SCAN ::: INICIANDO NEURAL GROUNDING [${module}]... Aplicando validación bilateral REGLA_DE_ORO.`, 
      createdAt: Date.now(), 
      agent: AgentType.SYSTEM 
    }]);
    
    try {
        setState(SystemState.ANALYSIS_ACTIVE);
        const matchesPromise = createAnalysisSession(module, learnedRules, globalIntel);
        
        let sportRecords: MatchDashboardData[] = [];
        // Context-aware historical loading
        if (module === ModuleType.LMB) {
            const lmbRecords = await lmbService.fetchAnalysis(5);
            sportRecords = lmbRecords.map(rec => ({
                id: rec.id, type: 'MATCH', league: 'LMB', matchup: `${rec.away_team} @ ${rec.home_team}`,
                homeTeam: rec.home_team, awayTeam: rec.away_team, projectedWinner: rec.prediction_winner,
                winnerProbability: rec.prediction_confidence * 100, winProbability: rec.prediction_confidence * 100,
                momentumScore: { home: 5, away: 5 }, playerProps: [], timestamp: new Date(rec.match_date).getTime(),
                edge: (rec.prediction_confidence * 10) - 5, prediction: `ML ${rec.prediction_winner}`,
                summary: `Vault LMB. Pitchers: ${rec.home_pitcher} vs ${rec.away_pitcher}`,
                stake: Math.floor(rec.prediction_confidence * 5), isFireSignal: rec.prediction_confidence >= 0.85,
                lmbContext: rec
            }));
        } else if (module === ModuleType.NFL) {
             const nflRecs = await nflService.fetchRecommendations(5);
             sportRecords = nflRecs.map(rec => ({
                 id: rec.id, type: 'MATCH', league: 'NFL', matchup: `${rec.away_team} @ ${rec.home_team}`,
                 homeTeam: rec.home_team, awayTeam: rec.away_team, projectedWinner: rec.home_team,
                 winnerProbability: rec.confidence_score * 100, winProbability: rec.confidence_score * 100,
                 momentumScore: { home: 5, away: 5 }, playerProps: [], timestamp: new Date(rec.analysis_timestamp).getTime(),
                 edge: rec.edge_percentage, prediction: rec.recommendation,
                 summary: `NFL Orbital. Injury: ${rec.injury_impact || 'No critical'}`,
                 stake: Math.floor(rec.confidence_score * 5), isFireSignal: rec.confidence_score >= 0.85 || rec.is_value_bet,
                 nflContext: rec
             }));
        } else if (module === ModuleType.NBA) {
             const nbaRecs = await nbaService.fetchRecommendations(5);
             sportRecords = nbaRecs.map(rec => ({
                 id: rec.id, type: 'MATCH', league: 'NBA', matchup: `${rec.away_team} @ ${rec.home_team}`,
                 homeTeam: rec.home_team, awayTeam: rec.away_team, projectedWinner: rec.home_team,
                 winnerProbability: rec.confidence_score * 100, winProbability: rec.confidence_score * 100,
                 momentumScore: { home: 5, away: 5 }, playerProps: [], timestamp: new Date(rec.analysis_timestamp).getTime(),
                 edge: rec.edge_percentage, prediction: rec.recommendation,
                 summary: `NBA Terminal. Titanium: ${rec.titanium_score || 'Calculating'}`,
                 stake: Math.floor(rec.confidence_score * 5), isFireSignal: rec.confidence_score >= 0.85,
                 nbaContext: rec
             }));
        } else if (module === ModuleType.NCAA) {
            setMessages(prev => [...prev, { 
                id: `ncaa-spec-${Date.now()}`, role: 'model', 
                text: "🎓 NCAA_MODULE_CALIBRATION ::: Escaneando ineficiencias en mercados universitarios. Priorizando ventaja en rotaciones de banca.", 
                createdAt: Date.now(), agent: AgentType.SOCRATES 
            }]);
        }

        const matches = await matchesPromise;
        
        if (matches.length > 0 || sportRecords.length > 0) {
            const finalSignals = [...(matches as MatchDashboardData[]), ...sportRecords];
            if (matches.length > 0) {
              setDebateSignal(matches[0] as MatchDashboardData);
              setState(SystemState.QUANTUM_COLLAPSE);
              (window as any).__pendingSignals = matches;
            } else {
              setActiveSignals(prev => [...finalSignals, ...prev]);
              setState(SystemState.STANDBY);
            }
        } else {
            setState(SystemState.STANDBY);
        }
    } catch(e) { 
        ksm.logActivity(module, 'Neural Grounding failed.', 'high');
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
    
    setMessages(prev => [...prev, { 
      id: `conf-${Date.now()}`, role: 'model', 
      text: "✅ DESPLIEGE_AUTORIZADO ::: Señales ancladas al dashboard orbital.", 
      createdAt: Date.now(), agent: AgentType.EXECUTOR 
    }]);
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
          <button onClick={() => setExpandedSignal(null)} className="mb-6 flex items-center gap-2 text-virtus-aztecCyan text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
            <ChevronLeft size={16} /> Volver al Dashboard
          </button>
          <AnalyticsPanel data={expandedSignal} />
        </div>
      );
    }

    if (view === 'AUTONOMOUS') {
      return (
        <div className="p-10 max-w-7xl mx-auto w-full space-y-12 animate-in zoom-in-95 duration-500 pb-24">
           {/* Primary Autonomous Hub */}
           <div className="bg-virtus-panel border border-virtus-aztecCyan/30 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Bot className="w-48 h-48 text-virtus-aztecCyan" />
              </div>
              <div className="flex items-center gap-8 mb-10 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-virtus-aztecCyan/10 border border-virtus-aztecCyan/30 flex items-center justify-center shadow-inner">
                  <Bot className={`w-12 h-12 text-virtus-aztecCyan ${state === SystemState.AUTONOMOUS_CYCLE ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Motor Autónomo KAIROS</h2>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.4em] mt-1">Background Orchestration v8.5</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
                 <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] font-black text-gray-600 uppercase mb-3 tracking-widest">Estado Motor</span>
                    <span className={`text-sm font-black font-mono tracking-tighter ${state === SystemState.AUTONOMOUS_CYCLE ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                      {state === SystemState.AUTONOMOUS_CYCLE ? 'ANALYZING_MARKET' : 'CORE_STANDBY'}
                    </span>
                 </div>
                 <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] font-black text-gray-600 uppercase mb-3 tracking-widest">Logs de Hoy</span>
                    <span className="text-xl font-black font-mono text-white">{autonomousLogs.length}</span>
                 </div>
                 <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] font-black text-gray-600 uppercase mb-3 tracking-widest">Salud Vercel</span>
                    <span className={`text-sm font-black font-mono ${healthData?.status === 'operational' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {healthData?.status?.toUpperCase() || 'READY'}
                    </span>
                 </div>
              </div>

              <button 
                onClick={runAutonomousCycle}
                disabled={state !== SystemState.STANDBY}
                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all relative z-10 flex items-center justify-center gap-6 ${state === SystemState.STANDBY ? 'bg-virtus-aztecCyan text-black hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-[1.01]' : 'bg-white/5 text-gray-600 grayscale cursor-not-allowed'}`}
              >
                {state === SystemState.AUTONOMOUS_CYCLE ? (
                  <> <RefreshCw className="animate-spin w-5 h-5" /> Ejecutando Ciclo Orbital...</>
                ) : (
                  <> <Zap className="w-5 h-5" /> Iniciar Scouting y Post-Mortem Manual </>
                )}
              </button>
           </div>

           {/* Scheduled External Workflows (GitHub Actions) */}
           <div className="space-y-6">
              <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-4">
                <Github className="w-4 h-4 text-white" /> Workflows de GitHub & Crons Externos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {externalWorkflows.length > 0 ? externalWorkflows.map((wf) => (
                  <div key={wf.id} className="bg-virtus-panel border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent opacity-50"></div>
                     <div className="flex items-start justify-between relative z-10 mb-6">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-2xl ${wf.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} shadow-inner`}>
                              <RefreshCw className={`w-6 h-6 ${wf.status === 'in_progress' ? 'animate-spin' : ''}`} />
                           </div>
                           <div>
                              <div className="text-[12px] font-black text-white uppercase tracking-tighter">{wf.name}</div>
                              <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase">Cron: {wf.cron_schedule}</div>
                           </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${wf.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                           {wf.status}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-white/5 pt-6">
                        <div>
                           <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Último Run</div>
                           <div className="text-[11px] font-mono font-bold text-gray-300 mt-1">{new Date(wf.last_run).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Siguiente Run</div>
                           <div className="text-[11px] font-mono font-bold text-virtus-aztecCyan mt-1 flex items-center justify-end gap-2">
                             <Calendar className="w-3 h-3" /> {new Date(wf.next_run).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                           </div>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="md:col-span-2 bg-black/30 border border-white/5 p-16 rounded-[2rem] text-center border-dashed">
                    <Github className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-20" />
                    <p className="text-[10px] text-gray-600 uppercase font-mono tracking-[0.3em]">No se han detectado workflows externos sincronizados.</p>
                  </div>
                )}
              </div>
           </div>

           {/* Autonomous Logs */}
           <div className="space-y-6">
              <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-4">
                <HistoryIcon className="w-4 h-4" /> Historial de Ciclos Internos
              </h3>
              <div className="space-y-4">
                {autonomousLogs.length > 0 ? autonomousLogs.map((log, i) => (
                  <div key={i} className="bg-virtus-panel/50 border border-white/5 p-6 rounded-3xl flex items-center justify-between animate-in slide-in-from-bottom-4 shadow-inner">
                    <div className="flex items-center gap-5">
                       <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-inner">
                         <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="text-[12px] font-black text-white uppercase tracking-widest">Sincronización Orbital Exitosa</div>
                         <div className="text-[10px] text-gray-500 font-mono mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                       </div>
                    </div>
                    <div className="flex gap-12 text-right">
                       <div>
                         <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest">PM Sync</div>
                         <div className="text-lg font-mono font-bold text-white">{log.post_mortem}</div>
                       </div>
                       <div>
                         <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Scouts</div>
                         <div className="text-lg font-mono font-bold text-virtus-aztecCyan">{log.scouting}</div>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-black/30 border border-white/5 p-16 rounded-[2rem] text-center border-dashed">
                    <Bot className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-20" />
                    <p className="text-[10px] text-gray-600 uppercase font-mono tracking-[0.3em]">No hay registros de ciclos autónomos en la sesión local.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      );
    }

    switch(view) {
        case 'SIGNALS':
            return (
                <div className="p-6 space-y-8 max-w-7xl mx-auto w-full pb-24">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between animate-in fade-in duration-700 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="flex items-center gap-4">
                        <Globe className="w-6 h-6 text-emerald-400" />
                        <div>
                          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Neural Grounding v8.5 Active</span>
                          <p className="text-[10px] text-gray-400 font-mono italic uppercase mt-1">Compliance: Bilateral validation enforced via REGLA_DE_ORO.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">REAL_TIME_ORBIT</span>
                      </div>
                    </div>

                    <ModuleSelector onSelect={handleModuleSelect} disabled={state !== SystemState.STANDBY && state !== SystemState.ANALYSIS_READY} currentModule={activeModule} />
                    
                    {state === SystemState.SCANNING || state === SystemState.ANALYSIS_ACTIVE || state === SystemState.NEURAL_GROUNDING || state === SystemState.AUTONOMOUS_CYCLE ? (
                        <div className="h-[450px] flex flex-col items-center justify-center text-virtus-aztecCyan border border-virtus-aztecCyan/20 bg-virtus-aztecCyan/5 rounded-[3rem] animate-pulse relative overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
                            <Cpu className="w-16 h-16 mb-8 text-virtus-aztecCyan animate-spin-slow" />
                            <span className="text-sm font-mono font-black uppercase tracking-[1em] mb-4">
                              {state === SystemState.AUTONOMOUS_CYCLE ? 'ORCHESTRATING_BACKGROUND...' : state === SystemState.NEURAL_GROUNDING ? 'NEURAL_GROUNDING_ACTIVE...' : 'DEEP_MARKET_PULSE...'}
                            </span>
                            <div className="w-72 h-1 bg-white/5 rounded-full overflow-hidden mt-6 shadow-inner">
                                <div className="h-full bg-virtus-aztecCyan animate-progress shadow-[0_0_10px_#00f3ff]"></div>
                            </div>
                        </div>
                    ) : activeSignals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-700">
                            {activeSignals.map((s, i) => (
                              s.type === 'MATCH' ? (
                                <SignalCard key={s.id || i} signal={s as MatchDashboardData} compact onExpand={() => setExpandedSignal(s)} onSimulate={(sig) => setSimulationSignal(sig)} />
                              ) : (
                                <AnalyticsPanel key={s.id || i} data={s} compact onExpand={() => setExpandedSignal(s)} />
                              )
                            ))}
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-700 border border-white/5 bg-black/30 rounded-[2.5rem] border-dashed">
                            <Sparkles className="w-20 h-20 opacity-10 text-virtus-aztecCyan mb-8" />
                            <span className="text-[12px] font-mono uppercase tracking-[1.5em] font-black text-white/10">KAIROS_V8.5_READY</span>
                        </div>
                    )}
                </div>
            );
        case 'TERMINAL':
            return (
                <div className="h-full flex flex-col overflow-hidden bg-black/20">
                    <TerminalOutput messages={messages} isThinking={state === SystemState.ANALYSIS_ACTIVE || state === SystemState.AUTONOMOUS_CYCLE} onClear={() => setMessages([])} />
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
        healthData={healthData}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onShowHistory={() => setShowHistoryModal(true)} onSync={initializeKairos} />
        <main className="flex-1 flex flex-col min-w-0 bg-virtus-bg relative">
            <div className="bg-black/80 border-b border-virtus-aztecCyan/10 flex px-6 backdrop-blur-xl z-10 shadow-2xl">
                <button onClick={() => { setView('SIGNALS'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'SIGNALS' ? 'text-white' : 'text-gray-500'}`}>
                    <LayoutDashboard className="w-4 h-4" /> Orbital Dashboard
                    {view === 'SIGNALS' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecCyan shadow-[0_0_15px_#00f3ff]"></div>}
                </button>
                <button onClick={() => { setView('TERMINAL'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'TERMINAL' ? 'text-white' : 'text-gray-500'}`}>
                    <TerminalIcon className="w-4 h-4" /> Deep Console
                    {view === 'TERMINAL' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecRed shadow-[0_0_15px_#ff003c]"></div>}
                </button>
                <button onClick={() => { setView('AUTONOMOUS'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'AUTONOMOUS' ? 'text-white' : 'text-gray-500'}`}>
                    <Bot className="w-4 h-4" /> Autonomous Engine
                    {view === 'AUTONOMOUS' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>}
                </button>
                <button onClick={() => { setView('PULSE'); setExpandedSignal(null); }} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${view === 'PULSE' ? 'text-white' : 'text-gray-500'}`}>
                    <Zap className="w-4 h-4" /> Live Nerve
                    {view === 'PULSE' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 shadow-[0_0_15px_#ffd700]"></div>}
                </button>
                <div className="flex-1"></div>
                <button onClick={toggleLiveLink} className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${state === SystemState.LIVE_LINK ? 'text-virtus-aztecCyan' : 'text-gray-500 hover:text-white'}`}>
                    <Radio className={`w-4 h-4 ${state === SystemState.LIVE_LINK ? 'animate-pulse' : ''}`} /> Neural Link
                    {state === SystemState.LIVE_LINK && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-virtus-aztecCyan shadow-[0_0_15px_#00f3ff]"></div>}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto z-10 custom-scrollbar">{renderMainView()}</div>
            <Toolbar metrics={govMetrics} state={state} systemStats={systemStats} onManualSync={initializeKairos} />
        </main>
      </div>
      {showHistoryModal && <HistoryModal tickets={ticketHistory} onClose={() => setShowHistoryModal(false)} onUpdateStatus={(id, s) => ksm.updateTicketStatus(id, s)} />}
      {simulationSignal && <MonteCarloEngine signal={simulationSignal} onClose={() => setSimulationSignal(null)} />}
      {debateSignal && <NeuralDebateOverlay signal={debateSignal} onConfirm={confirmDebate} />}
      {isLiveLinkOpen && <LiveNeuralScout onClose={() => { setIsLiveLinkOpen(false); setState(SystemState.STANDBY); }} />}
    </div>
  );
};

export default App;
