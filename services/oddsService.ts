
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
    API_KEY: process.env.THE_ODDS_API_KEY || 'dd5186c23e0be2ad862313449b0078b5',
    BASE_URL: 'https://api.the-odds-api.com/v4/sports',

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

    mapSportKey(internalSport: ModuleType): string {
        const mapping: Record<string, string> = {
            'NBA': 'basketball_nba',
            'NFL': 'americanfootball_nfl',
            'MLB': 'baseball_mlb',
            'LMB': 'baseball_mlb', // Fallback a MLB para cuotas si LMB no está disponible
            'SOCCER_EUROPE': 'soccer_epl',
            'SOCCER_AMERICAS': 'soccer_mexico_liga_mx',
        };
        return mapping[internalSport] || 'soccer_epl';
    }
};
