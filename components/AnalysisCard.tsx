
import React from 'react';
import { MatchAnalysis } from '../types';
import { Trophy, Activity, AlertTriangle, Code, Brain, DollarSign, BarChart3, TrendingUp, Globe, Lock, ShieldCheck } from 'lucide-react';

interface AnalysisCardProps {
  analysis: MatchAnalysis;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const evPercent = analysis.expectedValue ? (analysis.expectedValue * 100).toFixed(1) : (analysis.edge).toFixed(1);
  const titaniumScore = analysis.titaniumScore || (analysis.expectedValue ? Math.round(analysis.expectedValue * 1000) : Math.round(analysis.edge * 10));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-500 shadow-[0_0_60px_rgba(0,0,0,0.8)] group/card">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 shadow-inner">
        <div>
          <span className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase mb-2 block">
            {analysis.league || analysis.leagueName} | KAIROS v4.0
          </span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover/card:text-cyan-400 transition-colors">
            {analysis.matchup || `${analysis.awayTeam} @ ${analysis.homeTeam}`}
          </h3>
        </div>
        <div className="flex gap-5 items-center">
            <div className="text-right">
              <div className="flex items-center gap-2 text-emerald-400 font-black justify-end uppercase tracking-tighter">
                <Trophy size={18} className="animate-pulse" />
                <span>{analysis.projectedWinner}</span>
              </div>
              <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-1 block">NEURAL_CONF: {analysis.winProbability || (analysis.winnerProbability * 100)}%</span>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-4 py-2 flex flex-col items-center shadow-inner">
                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Titanium</span>
                <span className="text-xl font-mono font-black text-indigo-400 leading-none mt-1">{titaniumScore}</span>
            </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Momentum & Market Value */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-cyan-300 font-black text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span>Momentum Balance Matrix</span>
              </div>
              <span className="text-gray-600 font-mono">CALCULATING_DELTA...</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 flex overflow-hidden shadow-inner border border-white/5">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full transition-all duration-1500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                style={{ width: `${(analysis.momentumScore?.away || 5) * 10}%` }}
              />
              <div 
                className="bg-gradient-to-l from-indigo-600 to-indigo-400 h-full transition-all duration-1500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${(analysis.momentumScore?.home || 5) * 10}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest">
              <span>Away_Momentum: {analysis.momentumScore?.away || 'STABLE'}</span>
              <span>Home_Momentum: {analysis.momentumScore?.home || 'STABLE'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner group/stat hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-gray-600 group-hover/stat:text-cyan-400 transition-colors" />
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Market Odds</span>
                </div>
                <div className="text-2xl font-mono font-black text-white">{analysis.marketOdds || '1.91'}</div>
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner group/stat hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-600 group-hover/stat:text-emerald-400 transition-colors" />
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Neural Edge</span>
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">+{evPercent}%</div>
            </div>
          </div>

          <div className="space-y-3 bg-black/30 p-5 rounded-3xl border border-white/5 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30"></div>
            <div className="flex items-center gap-2 text-amber-400 font-black text-[10px] uppercase tracking-widest">
              <AlertTriangle size={16} />
              <span>Context & Risk Analysis</span>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed uppercase tracking-tighter italic">
                {analysis.injuryReport || analysis.summary}
            </p>
          </div>
        </div>

        {/* Props - Golden Rule Applied */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Winning Props v4.0</h4>
              <span className="text-[8px] text-emerald-500 font-mono uppercase tracking-widest mt-1">REGLA_DE_ORO: ACTIVE</span>
            </div>
            <div className="px-4 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 shadow-inner">
              <Lock size={12} className="animate-pulse" /> {analysis.projectedWinner} Only
            </div>
          </div>
          
          <div className="space-y-3">
            {(analysis.playerProps || []).map((prop, idx) => (
              <div key={idx} className="flex items-center justify-between bg-black/60 p-5 rounded-[2rem] border border-white/5 hover:border-emerald-500/40 transition-all shadow-inner group/prop relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/prop:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-1.5 h-8 bg-emerald-500/40 rounded-full group-hover/prop:bg-emerald-400 group-hover/prop:shadow-[0_0_10px_#10b981] transition-all"></div>
                  <div>
                    <div className="text-[13px] font-black text-white uppercase tracking-tight font-mono">{prop.player}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1">{prop.propType}</div>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-base font-mono text-cyan-400 font-black tracking-tighter">{prop.projection}</div>
                  <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Confidence: {(prop.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
            
            {/* Added visual "Neural Lock" line to emphasize Golden Rule */}
            <div className="pt-2 flex flex-col items-center opacity-30 group-hover/card:opacity-60 transition-opacity">
               <div className="w-px h-6 bg-gradient-to-b from-emerald-500/0 to-emerald-500"></div>
               <div className="px-3 py-1 border border-emerald-500 rounded-full flex items-center gap-2">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">Bilateral Constraint Verified</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logic Summary */}
      <div className="p-6 bg-indigo-950/20 border-t border-white/5 shadow-inner">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 shadow-inner">
            <Brain className="text-indigo-400" size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Neural Arbitration Matrix</span>
            <p className="text-xs text-indigo-100/70 font-medium font-mono tracking-tighter mt-2 italic uppercase leading-relaxed">
              {analysis.debate?.socrates || analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Grounding sources */}
      {analysis.groundingSources && analysis.groundingSources.length > 0 && (
        <div className="p-6 border-t border-white/5 bg-emerald-950/10">
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
            <Globe size={14} className="animate-spin-slow" /> Grounded Neural Sources [Search_Grounding]
          </div>
          <div className="flex flex-wrap gap-3">
            {analysis.groundingSources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] px-4 py-2 bg-black/40 border border-emerald-500/20 rounded-2xl text-emerald-300 hover:bg-emerald-500/20 transition-all font-mono uppercase tracking-tighter shadow-inner"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* JSON Output */}
      <details className="group/json">
        <summary className="list-none p-4 text-center text-[9px] font-black font-mono text-slate-700 hover:text-cyan-400 cursor-pointer flex items-center justify-center gap-3 bg-black/60 transition-all tracking-[0.3em] border-t border-white/5 uppercase">
          <Code size={14} className="group-hover/json:rotate-12 transition-transform" />
          <span>Telemetría_Neural_Cruda</span>
        </summary>
        <div className="p-6 bg-black border-t border-white/5">
          <pre className="text-[10px] font-mono text-emerald-400/50 overflow-x-auto p-6 rounded-[2rem] border border-emerald-950/30 bg-slate-950 shadow-inner">
            {analysis.supabaseJson || JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default AnalysisCard;
