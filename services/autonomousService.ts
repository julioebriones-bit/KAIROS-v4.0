
import { GoogleGenAI, Type } from "@google/genai";
import { ksm } from "../stateManager";
import { BetTicket, BetStatus, AutonomousLog } from "../types";
import { saveTicket } from "../supabaseClient";

/**
 * KAIROS_V8_AUTONOMOUS_ENGINE
 * Handles post-mortem analysis and new daily scouting autonomously.
 */

export const autonomousService = {
  /**
   * Runs a complete autonomous cycle: Post-Mortem + Scouting.
   */
  async runCycle(): Promise<AutonomousLog> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const startTime = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const log: AutonomousLog = { post_mortem: 0, scouting: 0, errors: [], timestamp: startTime };

    ksm.logActivity('AUTONOMOUS', '🌀 Iniciando Ciclo Autónomo KAIROS v8.5...', 'high');

    try {
      // 1. POST-MORTEM: Verify pending results
      const tickets = ksm.getHistory().filter(t => t.status === BetStatus.PENDING).slice(0, 10);
      
      for (const t of tickets) {
        try {
          ksm.logActivity('AUTONOMOUS', `🔍 Verificando Post-Mortem: ${t.homeTeam} vs ${t.awayTeam}`, 'low');
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `RESULTADO FINAL: ${t.homeTeam} vs ${t.awayTeam}. Fecha: ${new Date(t.timestamp).toLocaleDateString()}. Retorna JSON indicando si terminó, score y ganador.`,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  finished: { type: Type.BOOLEAN },
                  score: { type: Type.STRING },
                  winner: { type: Type.STRING, description: "HOME|AWAY|DRAW" }
                },
                required: ["finished", "score", "winner"]
              }
            }
          });

          const res = JSON.parse(response.text || "{}");
          if (res.finished) {
            const isWinnerHome = res.winner === 'HOME';
            const predictionIncludesHome = t.prediction.toLowerCase().includes(t.homeTeam.toLowerCase());
            const predictionIncludesAway = t.prediction.toLowerCase().includes(t.awayTeam.toLowerCase());
            
            let win = false;
            if (isWinnerHome && predictionIncludesHome) win = true;
            if (res.winner === 'AWAY' && predictionIncludesAway) win = true;

            await ksm.updateTicketStatus(t.id, win ? BetStatus.WON : BetStatus.LOST);
            log.post_mortem++;
          }
        } catch (e: any) {
          log.errors.push(`Post-Mortem Error [${t.id}]: ${e.message}`);
        }
      }

      // 2. SCOUTING: Identify today's top opportunities
      ksm.logActivity('AUTONOMOUS', `🛰️ Iniciando Scouting Orbital para ${today}...`, 'medium');
      const scoutingResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `JORNADA DE HOY (${today}): Identifica los 5 partidos TOP de Fútbol (Europa), NBA o MLB con mayor ineficiencia de mercado. Retorna JSON con equipos y liga.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                h: { type: Type.STRING, description: "Home team" },
                a: { type: Type.STRING, description: "Away team" },
                s: { type: Type.STRING, description: "Sport/Module (NBA, NFL, MLB, SOCCER_EUROPE)" },
                l: { type: Type.STRING, description: "League name" }
              },
              required: ["h", "a", "s", "l"]
            }
          }
        }
      });

      const matches = JSON.parse(scoutingResponse.text || "[]");
      for (const m of matches) {
        try {
          ksm.logActivity('AUTONOMOUS', `🧬 Generando Análisis Bilateral: ${m.h} vs ${m.a}`, 'low');
          const analysis = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analiza: ${m.h} vs ${m.a} (${m.l}). Pronostica ganador y cuota de valor. REGLA DE ORO: Props al GANADOR solamente.`,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  p: { type: Type.STRING, description: "The specific prediction" },
                  c: { type: Type.NUMBER, description: "Confidence index 0-100" },
                  e: { type: Type.NUMBER, description: "Market edge percentage 0-20" },
                  s: { type: Type.NUMBER, description: "Stake recommendation 1-5" },
                  r: { type: Type.STRING, description: "Neural summary of reasoning" }
                },
                required: ["p", "c", "e", "s", "r"]
              }
            }
          });

          const ana = JSON.parse(analysis.text || "{}");
          const gid = `auto-${today}-${m.h}-${m.a}`.toLowerCase().replace(/\s/g, '-');
          
          const ticket: BetTicket = {
            id: gid,
            module: m.s,
            homeTeam: m.h,
            awayTeam: m.a,
            prediction: ana.p,
            edge: ana.e,
            stake: ana.s,
            summary: ana.r,
            status: BetStatus.PENDING,
            isFireSignal: ana.c > 85,
            timestamp: Date.now()
          };

          await saveTicket(ticket);
          ksm.updateTicket(ticket);
          log.scouting++;
        } catch (e: any) {
          log.errors.push(`Scouting Error [${m.h}]: ${e.message}`);
        }
      }

      ksm.logActivity('AUTONOMOUS', `✅ Ciclo Completado. PM: ${log.post_mortem} | Scout: ${log.scouting}`, 'medium');
      return log;

    } catch (err: any) {
      ksm.logActivity('AUTONOMOUS', `🚨 Fallo Crítico en Ciclo Autónomo: ${err.message}`, 'critical');
      log.errors.push(`Global Error: ${err.message}`);
      return log;
    }
  }
};
