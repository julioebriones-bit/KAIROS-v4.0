
import { supabase } from '../supabaseClient';
import { ExternalWorkflow } from '../types';

export const externalWorkflowService = {
  /**
   * Fetches the state of external data fetchers (GitHub Actions).
   */
  async fetchWorkflows(): Promise<ExternalWorkflow[]> {
    if (!supabase) {
      // Mock data for local testing
      return [
        {
          id: 'gh-sports-data',
          name: 'Update Sports Data (Midnight Sync)',
          last_run: new Date(Date.now() - 3600000 * 4).toISOString(),
          status: 'success',
          cron_schedule: '0 0 * * *',
          next_run: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('cron_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Group or format into ExternalWorkflow items
      // Assuming cron_executions logs name, status, and duration
      return (data || []).map(d => ({
        id: d.id,
        name: d.cron_name || 'System Workflow',
        last_run: d.created_at,
        status: d.status === 'success' ? 'success' : 'failure',
        cron_schedule: '0 0 * * *',
        next_run: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
      }));
    } catch (e) {
      console.error('ExternalWorkflowService Error:', e);
      return [];
    }
  }
};
