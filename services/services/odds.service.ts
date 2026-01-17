/**
 * SERVICIO: Odds Service
 * Responsable de obtener cuotas reales de diferentes bookmakers (Pinnacle, Bet365, etc.)
 */
import { ModuleType } from '../types';

interface OddsResponse {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: Array<{
        key: string;
        title: string;
        last_update: string;
        markets: Array<{
            key: string;
            outcomes: Array<{
                name: string;
                price: number;
            }>;
        }>;
    }>;
}

export const oddsService = {
    // API Key activa del usuario
    API_KEY: process.env.THE_ODDS_API_KEY || 'dd5186c23e0be2ad862313449b0078b5',
    BASE_URL: 'https://api.the-odds-api.com/v4/sports',

    /**
     * Obtiene cuotas para un deporte y región específicos
     * @param sportKey Ejemplo: 'soccer_mexico_liga_mx', 'americanfootball_nfl'
     * @param region 'us', 'eu', 'au'
     */
    async fetchLiveOdds(sportKey: string, region: string = 'us'): Promise<OddsResponse[]> {
        try {
            const url = `${this.BASE_URL}/${sportKey}/odds/?apiKey=${this.API_KEY}&regions=${region}&markets=h2h,spreads,totals&oddsFormat=decimal`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error fetching odds: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('OddsService Error:', error);
            return [];
        }
    },

    /**
     * Mappea los nombres de deportes de SofaScore o internos a los de The Odds API
     */
    mapSportKey(internalSport: ModuleType): string {
        const mapping: Record<string, string> = {
            'NBA': 'basketball_nba',
            'NFL': 'americanfootball_nfl',
            'MLB': 'baseball_mlb',
            'SOCCER': 'soccer_epl', // Por defecto Premier League, ajustable
        };
        return mapping[internalSport] || 'soccer_epl';
    }
};
