
import { GoogleGenAI, Type } from "@google/genai";
import { ksm } from "../stateManager";
import { BetTicket, BetStatus, AutonomousLog } from "../types";
import { saveTicket } from "../supabaseClient";

/**
 * KAIROS_V8_AUTONOMOUS_ENGINE
 * Motor de Auditoría Neural y Scouting de Valor.
 */

export const autonomousService = {
  /**
   * Ejecuta un ciclo completo: Auditoría de Resultados (Post-Mortem) + Búsqueda de Oportunidades (Scouting).
   */
  async runCycle(): Promise<AutonomousLog> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const startTime = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const log: AutonomousLog = { post_mortem: 0, scouting: 0, errors: [], timestamp: startTime };

    ksm.logActivity('AUTONOMOUS', '🌀 Iniciando Auditoría Neural KAIROS v4.0...', 'high');

    try {
      // 1. POST-MORTEM (AUDITORÍA): Verificar resultados de apuestas pendientes
      const pendingTickets = ksm.getHistory().filter(t => t.status === BetStatus.PENDING).slice(0, 15);
      
      if (pendingTickets.length > 0) {
        ksm.logActivity('AUTONOMOUS', `🔍 Auditando ${pendingTickets.length} señales pendientes...`, 'medium');
        
        for (const t of pendingTickets) {
          try {
            const auditPrompt = `
              AUDITORÍA DEPORTIVA KAIROS.
              Evento: ${t.homeTeam} vs ${t.awayTeam} (${t.module}).
              Fecha del registro: ${new Date(t.timestamp).toLocaleDateString()}.
              Predicción a verificar: "${t.prediction}".
              
              INSTRUCCIONES:
              1. Busca el resultado final oficial de este encuentro.
              2. Determina si la predicción mencionada fue acertada (WON), fallida (LOST) o si el mercado fue anulado (VOID).
              3. Si el juego no ha terminado o no ha comenzado, marca finished como false.
            `;

            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: auditPrompt,
              config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    finished: { type: Type.BOOLEAN, description: "True if the match ended and result is official" },
                    score: { type: Type.STRING, description: "Final official score (e.g. 102-98)" },
                    status: { 
                      type: Type.STRING, 
                      description: "WON, LOST, VOID or PENDING if not finished" 
                    },
                    reason: { type: Type.STRING, description: "Brief explanation of the audit verdict" }
                  },
                  required: ["finished", "score", "status", "reason"]
                }
              }
            });

            const res = JSON.parse(response.text || "{}");
            
            if (res.finished && res.status !== 'PENDING') {
              const newStatus = res.status as BetStatus;
              await ksm.updateTicketStatus(t.id, newStatus);
              ksm.logActivity('AUTONOMOUS', `✅ Auditoría completada [${t.homeTeam} vs ${t.awayTeam}]: ${newStatus} (${res.score})`, 'medium');
              log.post_mortem++;
            } else {
              ksm.logActivity('AUTONOMOUS', `⏳ El encuentro ${t.homeTeam} vs ${t.awayTeam} sigue en espera de confirmación oficial.`, 'low');
            }
          } catch (e: any) {
            console.error(`Audit Error for ${t.id}:`, e);
            log.errors.push(`Audit Error [${t.id}]: ${e.message}`);
          }
        }
      }

      // 2. SCOUTING: Identificar nuevas oportunidades de valor
      ksm.logActivity('AUTONOMOUS', `🛰️ Iniciando Scouting Orbital para la jornada de hoy...`, 'medium');
      const scoutingResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `JORNADA ACTUAL (${today}): Escanea los mercados de MLB, NBA y Fútbol Europeo. Identifica las 5 ineficiencias de mercado más claras (EV+). Aplica la REGLA DE ORO (Props solo al ganador).`,
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
                s: { type: Type.STRING, description: "Module (NBA, MLB, SOCCER_EUROPE)" },
                p: { type: Type.STRING, description: "Winning prediction" },
                e: { type: Type.NUMBER, description: "Edge percentage (0-20)" },
                st: { type: Type.NUMBER, description: "Stake (1-5)" },
                r: { type: Type.STRING, description: "Neural reasoning summary" }
              },
              required: ["h", "a", "s", "p", "e", "st", "r"]
            }
          }
        }
      });

      const matches = JSON.parse(scoutingResponse.text || "[]");
      for (const m of matches) {
        try {
          const gid = `auto-${today}-${m.h}-${m.a}`.toLowerCase().replace(/\s/g, '-');
          
          const ticket: BetTicket = {
            id: gid,
            module: m.s as any,
            homeTeam: m.h,
            awayTeam: m.a,
            prediction: m.p,
            edge: m.e,
            stake: m.st,
            summary: m.r,
            status: BetStatus.PENDING,
            isFireSignal: m.e > 12,
            timestamp: Date.now()
          };

          await saveTicket(ticket);
          ksm.updateTicket(ticket);
          log.scouting++;
        } catch (e: any) {
          log.errors.push(`Scouting Error [${m.h}]: ${e.message}`);
        }
      }

      ksm.logActivity('AUTONOMOUS', `🏁 Ciclo Finalizado. Auditados: ${log.post_mortem} | Nuevos: ${log.scouting}`, 'high');
      return log;

    } catch (err: any) {
      ksm.logActivity('AUTONOMOUS', `🚨 Fallo Crítico: ${err.message}`, 'critical');
      log.errors.push(`Global Error: ${err.message}`);
      return log;
    }
  }
};
