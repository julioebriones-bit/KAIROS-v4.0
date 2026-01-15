
import { createClient } from '@supabase/supabase-js';
import { ModuleType, BetTicket, GlobalIntelligence, GlobalSummary, BetStatus } from './types';

const supabaseUrl = process.env.SUPABASE_URL || 'https://leoenlegychbjxzmmfrk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_55xXVo7kKqrYU51_yR3IYg_t20mzNXP';

// Initialize client ONLY if URL and KEY are present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const saveTicket = async (ticket: BetTicket): Promise<boolean> => {
  try {
    if (!supabase) {
      console.log("MOCK_PERSISTENCE: Saving signal...", ticket.id);
      return true;
    }
    
    // Fix: Omit 'timestamp' from DB payload as column doesn't exist. 
    // We map it to 'created_at' which is the standard Supabase column.
    const { timestamp, ...rest } = ticket;
    const dbTicket = {
      ...rest,
      created_at: new Date(timestamp || Date.now()).toISOString()
    };
    
    const { error } = await supabase.from('tickets').upsert([dbTicket], { onConflict: 'id' });
    if (error) {
      console.error("Supabase Save Error:", JSON.stringify(error, null, 2));
      return false;
    }
    return true;
  } catch (e) {
    console.error("Persistence exception:", e);
    return false;
  }
};

export const fetchTickets = async (module: ModuleType): Promise<BetTicket[]> => {
  try {
    if (!supabase) {
      await new Promise(r => setTimeout(r, 400));
      return getMockTickets();
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      // PGRST204/PGRST205 error codes are usually missing tables/columns
      console.warn("Fetch tickets error (falling back to mocks):", error.message);
      return getMockTickets();
    }

    return (data as any[]).map(row => {
      // Map 'created_at' back to 'timestamp' for app internal types
      const { created_at, ...rest } = row;
      return {
        ...rest,
        timestamp: row.timestamp || new Date(created_at).getTime()
      };
    }) as BetTicket[];
  } catch (e) {
    console.error("Fetch tickets exception:", e);
    return getMockTickets();
  }
};

const getMockTickets = (): BetTicket[] => [
  { 
    id: 'mock-1', homeTeam: 'Lakers', awayTeam: 'Warriors', prediction: 'Warriors ML', 
    edge: 15.2, stake: 4, status: BetStatus.WON, module: ModuleType.NBA, 
    timestamp: Date.now() - 86400000, isFireSignal: true 
  },
  { 
    id: 'mock-2', homeTeam: 'Diablos', awayTeam: 'Sultanes', prediction: 'Diablos -1.5', 
    edge: 8.4, stake: 2, status: BetStatus.LOST, module: ModuleType.LMB, 
    timestamp: Date.now() - 43200000, isFireSignal: false 
  }
];

export const fetchRules = async (): Promise<string[]> => {
  try {
    if (!supabase) return getDefaultRules();
    const { data, error } = await supabase.from('rules').select('content');
    if (error) {
      return getDefaultRules();
    }
    return data?.map(r => r.content) || getDefaultRules();
  } catch (e) {
    return getDefaultRules();
  }
};

const getDefaultRules = () => [
  "Golden Rule (28-Sep): Props assigned only to projected winner.",
  "Value Betting: Minimum EV threshold +3% required.",
  "LMB: Priority to home team momentum."
];

export const fetchGlobalIntelligence = async (): Promise<GlobalIntelligence[]> => {
  try {
    if (!supabase) return getMockIntel();
    const { data, error } = await supabase.from('ai_memory').select('*');
    if (error) {
      return getMockIntel();
    }
    return data?.map(d => ({
      id: d.id || d.pattern_description,
      topic: d.category,
      summary: d.pattern_description,
      relevance: d.impact_score / 2
    })) || getMockIntel();
  } catch (e) {
    return getMockIntel();
  }
};

const getMockIntel = () => [
  { id: 'intel-1', topic: 'NBA Fatigue', summary: 'Celtics load management expected.', relevance: 0.95 }
];

export const fetchGlobalSummary = async (): Promise<GlobalSummary> => {
  return { dailyYield: +12.4, activeSignals: 8, winRate: 68.5 };
};
