
import { supabase } from '../supabaseClient';
import { NbaRecommendation, NbaPlayerProjection } from '../types';

export const nbaService = {
    /**
     * Obtiene recomendaciones específicas de NBA con campos avanzados (Titanium Score, Hook Protection).
     */
    async fetchRecommendations(limit = 50): Promise<NbaRecommendation[]> {
        if (!supabase) {
            console.warn('⚠️ [NBA_SERVICE] Supabase uninitialized. Skipping fetch.');
            return [];
        }

        const { data, error } = await supabase
            .from('nba_recommendations')
            .select('*')
            .order('analysis_timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [NBA_SERVICE] Error fetching recommendations:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene proyecciones de jugadores para NBA.
     */
    async fetchPlayerProjections(matchId?: string): Promise<NbaPlayerProjection[]> {
        if (!supabase) return [];

        let query = supabase.from('nba_player_projections').select('*').order('points', { ascending: false });

        if (matchId) {
            query = query.eq('match_id', matchId);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            console.error('❌ [NBA_SERVICE] Error fetching player projections:', error);
            return [];
        }
        return data || [];
    }
};
