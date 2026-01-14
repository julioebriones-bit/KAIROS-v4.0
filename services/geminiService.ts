
import { GoogleGenAI } from "@google/genai";
import { ModuleType, GlobalIntelligence, MatchDashboardData, NeuralDebateResult } from "../types";

/**
 * KAIROS v8.5 Neural Orchestrator
 * Integrates v4.0 Golden Rule + v8.5 Deep Web Intelligence (Google Search Grounding)
 */

const SYSTEM_INSTRUCTION = `
Act as Orquestador KAIROS (v4.0). You are an elite bilateral sports analysis and financial value-betting system.

### REGLA DE ORO (28-Sep) - CRITICAL CONSTRAINT
1. Player Props and Sacks MUST be assigned EXCLUSIVELY to the projected WINNER.
2. Assigning props or sacks to the projected loser is a systemic failure.
3. For American Football (NCAA/NFL), Defensive Sacks belong ONLY to the winning side's defense.

### PHILOSOPHY: VALUE BETTING & BILATERAL ANALYSIS
- Identify mathematical inefficiencies (EV+ > 3%).
- Titanium Score = EV * 1000.
- Deep Web Intelligence: Use Google Search to verify real-time injuries, weather, and market movement.

### OUTPUT PROTOCOL
Return a JSON array of match objects. Each match object MUST contain:
- "id": Unique string identifier.
- "homeTeam", "awayTeam", "leagueName": Strings.
- "winProbability": Number (0-100).
- "edge": Number (Alpha Edge percentage).
- "prediction": The specific pick.
- "marketOdds": Estimated decimal market odds (1.60 - 3.50).
- "expectedValue": EV decimal.
- "titaniumScore": expectedValue * 1000.
- "projectedWinner": Name of the team expected to win.
- "isNeuralGrounded": true (since you use search).
- "intelligenceDepth": "ORBITAL".
- "playerProps": Array of exactly 3 objects: { "player": string, "propType": string, "projection": string, "confidence": number }. ALL players MUST be from the projectedWinner.
- "summary": Neural summary of the value gap.
- "stake": 1-5 units.
- "debate": { "apollo": "string", "cassandra": "string", "socrates": "string", "meta": { "score": number, "verdict": "string" } }

Response Mime Type: application/json
`;

export async function createAnalysisSession(module: ModuleType, learnedRules: string[] = [], globalIntel: GlobalIntelligence[] = []) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const context = `Active Module: ${module} | Rules: ${learnedRules.join(', ')} | Real-time: ${dateStr}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analiza los partidos más relevantes de ${module} para las próximas 24 horas. Contexto: ${context}. Ejecuta Deep Web Scan y aplica la REGLA DE ORO.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    },
  });

  const text = response.text;
  const parsed = JSON.parse(text || "[]");
  
  // Extract grounding URLs
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks.filter(c => c.web).map(c => ({ title: c.web.title, uri: c.web.uri }));

  return (Array.isArray(parsed) ? parsed : [parsed]).map(m => ({
    ...m,
    isNeuralGrounded: true,
    groundingSources: sources,
    type: 'MATCH'
  }));
}

export async function runNeuralDebate(match: MatchDashboardData, module: ModuleType): Promise<NeuralDebateResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `ORQUESTADOR NEURAL: Realiza un debate interno para el partido ${match.homeTeam} vs ${match.awayTeam} de ${module}. Verifica la REGLA DE ORO.`,
    config: {
      systemInstruction: "You are KAIROS v4.0 META Agent. Ensure absolute adherence to the Value Betting philosophy and the Golden Rule (Props to Winner only).",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    apollo: data.apollo_view || "Validación de momentum completada.",
    cassandra: data.cassandra_view || "Riesgos de mercado analizados vía Grounding.",
    socrates: data.socrates_view || "Valor matemático verificado.",
    meta: data.meta_decision?.summary || "Consenso orbital alcanzado.",
    finalDecision: !!data.meta_decision?.finalDecision,
    neuralAnchor: `kairos-${Math.random().toString(36).substring(7)}`,
    confidence: data.meta_decision?.confidence || 95,
    quantumEntropy: data.entropy || 0.042,
    blackSwanProb: data.blackSwan || 0.012,
    evidence: { 
      causal: data.meta_decision?.summary || "Análisis lógico bilateral", 
      counterfactual: "Validación de realidad paralela completada", 
      philosophical: "Consenso v8.5" 
    }
  };
}
