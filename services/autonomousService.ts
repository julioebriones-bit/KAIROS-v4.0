
import { GoogleGenAI, Type } from "@google/genai";
import { ksm } from "../stateManager";
import { BetTicket, BetStatus, AutonomousLog } from "../types";
import { saveTicket } from "../supabaseClient";
import { oddsService } from "./oddsService";

/**
 * KAIROS_V8_AUTONOMOUS_ENGINE
 * Motor de Auditoría Neural y Scouting de Valor.
 */

export const autonomousService = {
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
              Fecha: ${new Date(t.timestamp).toLocaleDateString()}.
              Predicción: "${t.prediction}".
              
              INSTRUCCIONES:
              1. Busca el resultado final oficial de este encuentro.
              2. Determina si la predicción fue acertada (WON), fallida (LOST) o si el mercado fue anulado (VOID).
              3. Responde en JSON estricto.
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
                    finished: { type: Type.BOOLEAN },
                    score: { type: Type.STRING },
                    status: { type: Type.STRING, description: "WON, LOST, VOID o PENDING" },
                    reason: { type: Type.STRING }
                  },
                  required: ["finished", "score", "status", "reason"]
                }
              }
            });

            const res = JSON.parse(response.text || "{}");
            
            if (res.finished && res.status !== 'PENDING') {
              const newStatus = res.status as BetStatus;
              await ksm.updateTicketStatus(t.id, newStatus);
              ksm.logActivity('AUTONOMOUS', `✅ Auditoría: [${t.homeTeam} vs ${t.awayTeam}] -> ${newStatus}`, 'medium');
              log.post_mortem++;
            }
          } catch (e: any) {
            log.errors.push(`Audit Error [${t.id}]: ${e.message}`);
          }
        }
      }

      // 2. SCOUTING: Buscar cuotas reales y detectar EV+
      const sportKey = oddsService.mapSportKey(ksm.getCurrentSport());
      ksm.logActivity('AUTONOMOUS', `🛰️ Scouting orbital activo para ${sportKey}...`, 'medium');
      
      const liveOdds = await oddsService.fetchLiveOdds(sportKey);
      if (liveOdds.length > 0) {
          ksm.logActivity('AUTONOMOUS', `📈 Encontrados ${liveOdds.length} mercados con cuotas reales. Analizando EV+...`, 'low');
          // Aquí el modelo analizaría el valor comparando liveOdds vs proyecciones internas
      }

      ksm.logActivity('AUTONOMOUS', `🏁 Ciclo Finalizado. Auditorías: ${log.post_mortem}`, 'high');
      return log;

    } catch (err: any) {
      ksm.logActivity('AUTONOMOUS', `🚨 Fallo Crítico: ${err.message}`, 'critical');
      log.errors.push(`Global Error: ${err.message}`);
      return log;
    }
  }
};
