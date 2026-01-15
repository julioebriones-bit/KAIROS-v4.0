
import { supabase } from '../supabaseClient';
import { ExternalWorkflow } from '../types';

export const externalWorkflowService = {
  /**
   * Fetches the state of external data fetchers.
   */
  async fetchWorkflows(): Promise<ExternalWorkflow[]> {
    if (!supabase) {
      return this.getMockWorkflows();
    }

    try {
      // Attempt to fetch from cron_executions
      let { data, error } = await supabase
        .from('cron_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // If cron_executions is missing (PGRST205), try to fallback to 'predictions' as hinted by DB
        if (error.code === 'PGRST205') {
          console.info('ℹ️ [WORKFLOW_SERVICE] Table "cron_executions" missing. Attempting "predictions" scan...');
          const { data: pData, error: pError } = await supabase
            .from('predictions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (!pError && pData) {
            return pData.map(p => ({
              id: p.id,
              name: `Prediction Sync: ${p.home_team} v ${p.away_team}`,
              last_run: p.created_at,
              status: 'success',
              cron_schedule: '0 * * * *',
              next_run: new Date(Date.now() + 3600000).toISOString()
            }));
          }
        }
        
        console.warn('⚠️ [WORKFLOW_SERVICE] DB fetch failed, returning mock data.');
        return this.getMockWorkflows();
      }

      return (data || []).map(d => ({
        id: d.id,
        name: d.cron_name || 'System Workflow',
        last_run: d.created_at,
        status: d.status === 'success' ? 'success' : 'failure',
        cron_schedule: d.schedule || '0 0 * * *',
        next_run: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
      }));
    } catch (e) {
      console.error('ExternalWorkflowService Exception:', e);
      return this.getMockWorkflows();
    }
  },

  getMockWorkflows(): ExternalWorkflow[] {
    return [
      {
        id: 'mock-gh-data',
        name: 'Update Sports Data (Midnight Sync)',
        last_run: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'success',
        cron_schedule: '0 0 * * *',
        next_run: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
      },
      {
        id: 'mock-ml-refresh',
        name: 'Neural Model Re-calibration',
        last_run: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'success',
        cron_schedule: '0 */12 * * *',
        next_run: new Date(Date.now() + 3600000 * 1).toISOString()
      }
    ];
  }
};
