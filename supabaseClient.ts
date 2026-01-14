
import { createClient } from '@supabase/supabase-js';
import { ModuleType, BetTicket, GlobalIntelligence, GlobalSummary, BetStatus } from './types';

const supabaseUrl = process.env.SUPABASE_URL || 'https://leoenlegychbjxzmmfrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_55xXVo7kKqrYU51_yR3IYg_t20mzNXP';

// Fix: Initialize client ONLY if URL and KEY are present to avoid "supabaseUrl is required" error.
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

let currentKey = supabaseKey || 'KAIROS_STUB_KEY_V4';

export const rotateSupabaseKey = (newKey: string) => {
  currentKey = newKey;
  console.log("Supabase Key Rotated:", currentKey.substring(0, 8) + "...");
};

export const resetSupabaseKey = () => {
  currentKey = supabaseKey || 'KAIROS_STUB_KEY_V4';
};

export const saveTicket = async (ticket: BetTicket): Promise<boolean> => {
  try {
    if (!supabase) {
      console.log("MOCK_PERSISTENCE: Saving signal state to vault...", ticket.id);
      return true;
    }
    const { error } = await supabase.from('tickets').upsert([ticket], { onConflict: 'id' });
    return !error;
  } catch (e) {
    console.error("Persistence error", e);
    return false;
  }
};

export const fetchTickets = async (module: ModuleType): Promise<BetTicket[]> => {
  try {
    if (!supabase) {
      await new Promise(r => setTimeout(r, 800));
      return [
        { 
          id: '1', 
          homeTeam: 'Lakers', 
          awayTeam: 'Warriors', 
          prediction: 'Warriors ML', 
          edge: 15.2, 
          stake: 4, 
          status: BetStatus.WON, 
          module: ModuleType.NBA, 
          timestamp: Date.now() - 86400000,
          isFireSignal: true 
        },
        { 
          id: '2', 
          homeTeam: 'Diablos', 
          awayTeam: 'Sultanes', 
          prediction: 'Diablos -1.5', 
          edge: 8.4, 
          stake: 2, 
          status: BetStatus.LOST, 
          module: ModuleType.LMB, 
          timestamp: Date.now() - 43200000,
          isFireSignal: false 
        }
      ];
    }
    const { data, error } = await supabase.from('tickets').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return (data as BetTicket[]) || [];
  } catch (e) {
    console.error("Fetch tickets error", e);
    return [];
  }
};

export const fetchRules = async (): Promise<string[]> => {
  try {
    if (!supabase) {
      return [
        "Golden Rule (28-Sep): Props assigned only to projected winner.",
        "Value Betting: Minimum EV threshold +3% required for all signals.",
        "LMB: Priority to home team momentum in doubleheaders.",
        "NBA: Heavy weight on 3-game road trip fatigue."
      ];
    }
    const { data } = await supabase.from('rules').select('content');
    return data?.map(r => r.content) || [];
  } catch (e) {
    return [];
  }
};

export const fetchGlobalIntelligence = async (): Promise<GlobalIntelligence[]> => {
  try {
    if (!supabase) {
      return [
        { id: 'intel-1', topic: 'NBA Fatigue', summary: 'Celtics playing 3rd game in 4 nights. Deep bench usage expected.', relevance: 0.95 },
        { id: 'intel-2', topic: 'Weather NCAA', summary: 'Heavy rain in Florida affecting pass volume. Under potential higher.', relevance: 0.88 },
        { id: 'intel-3', topic: 'Value Pattern', summary: 'High efficiency in Underdog ML after 2 consecutive road losses.', relevance: 0.92 }
      ];
    }
    const { data } = await supabase.from('ai_memory').select('*');
    return data?.map(d => ({
      id: d.id || d.pattern_description,
      topic: d.category,
      summary: d.pattern_description,
      relevance: d.impact_score / 2
    })) || [];
  } catch (e) {
    return [];
  }
};

export const fetchGlobalSummary = async (): Promise<GlobalSummary> => {
  return { dailyYield: +12.4, activeSignals: 8, winRate: 68.5 };
};
