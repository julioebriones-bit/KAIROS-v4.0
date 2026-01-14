
import { supabase } from '../supabaseClient';
import { SystemHealthData } from '../types';

export const systemHealthService = {
  /**
   * Obtiene el último registro de salud del sistema desde Supabase.
   */
  async fetchLatestHealth(): Promise<SystemHealthData | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('system_health')
        .select('data')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('❌ [HEALTH_SERVICE] Error fetching health record:', error);
        return null;
      }
      
      return data?.data as SystemHealthData;
    } catch (e) {
      console.error('❌ [HEALTH_SERVICE] Exception fetching health:', e);
      return null;
    }
  },

  /**
   * Simula o dispara una verificación de salud (si el endpoint existiera).
   * En este caso, solo consultamos el estado actual.
   */
  async runHealthCheck(): Promise<boolean> {
    if (!supabase) return false;
    
    // Aquí se podría llamar a un endpoint de API de Vercel si estuviera expuesto
    // Por ahora, simulamos el éxito si podemos conectar con Supabase.
    const { error } = await supabase.from('tickets').select('id').limit(1);
    return !error;
  }
};
