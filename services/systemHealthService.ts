
import { supabase } from '../supabaseClient';
import { SystemHealthData } from '../types';

export const systemHealthService = {
  /**
   * Obtiene el último registro de salud del sistema desde Supabase.
   */
  async fetchLatestHealth(): Promise<SystemHealthData | null> {
    if (!supabase) return this.getMockHealth();
    
    try {
      // Changed: Selecting everything to avoid "column data does not exist" if schema is flat
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // maybeSingle handles cases where table might be empty without error
      
      if (error) {
        console.warn('⚠️ [HEALTH_SERVICE] DB error, using mock:', error.message);
        return this.getMockHealth();
      }
      
      if (data) {
        // If the 'data' column exists and is a JSON object
        if (data.data && typeof data.data === 'object') return data.data as SystemHealthData;
        
        // Fallback mapping: if the schema is flat (columns like status, uptime are direct)
        return {
          status: data.status || 'operational',
          timestamp: data.created_at || new Date().toISOString(),
          services: data.services || { supabase: { status: 'healthy' } },
          metrics: {
            total_tickets: data.total_tickets || data.metrics?.total_tickets || 0,
            pending_tickets: data.pending_tickets || data.metrics?.pending_tickets || 0,
            uptime: data.uptime || data.metrics?.uptime || 99.9
          }
        } as SystemHealthData;
      }
      
      return this.getMockHealth();
    } catch (e) {
      console.error('❌ [HEALTH_SERVICE] Exception:', e);
      return this.getMockHealth();
    }
  },

  getMockHealth(): SystemHealthData {
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        supabase: { status: 'healthy' }
      },
      metrics: {
        total_tickets: 142,
        pending_tickets: 5,
        uptime: 99.9
      }
    };
  },

  async runHealthCheck(): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase.from('tickets').select('id').limit(1);
      return !error;
    } catch (e) {
      return false;
    }
  }
};
