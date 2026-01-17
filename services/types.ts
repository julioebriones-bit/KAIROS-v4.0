
// Enums mejor definidos
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AgentType {
  APOLLO = 'APOLLO',
  CASSANDRA = 'CASSANDRA',
  META = 'META',
  EXECUTOR = 'EXECUTOR',
  SYSTEM = 'SYSTEM',
  QUANTUM = 'QUANTUM',
  SOCRATES = 'SOCRATES'
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  QUEUED = 'QUEUED',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID'
}

export enum SystemState {
  STANDBY = 'STANDBY',
  SCANNING = 'SCANNING',
  ANALYSIS_READY = 'ANALYSIS_READY',
  ANALYSIS_ACTIVE = 'ANALYSIS_ACTIVE',
  AUTO_PILOT = 'AUTO_PILOT',
  HIBERNATION = 'HIBERNATION',
  MIDNIGHT_SYNC = 'MIDNIGHT_SYNC',
  QUANTUM_COLLAPSE = 'QUANTUM_COLLAPSE',
  BLACK_SWAN_SCAN = 'BLACK_SWAN_SCAN'
}

export enum ModuleType {
  NONE = 'NONE',
  GENERAL = 'GENERAL',
  NBA = 'NBA',
  NFL = 'NFL',
  MLB = 'MLB',
  LMB = 'LMB',
  SOCCER_EUROPE = 'SOCCER_EUROPE',
  SOCCER_AMERICAS = 'SOCCER_AMERICAS',
  TENNIS = 'TENNIS',
  NCAA = 'NCAA',
  BACKTEST = 'BACKTEST'
}

// Tipos base reutilizables
export type Timestamp = number;
export type UUID = string;

// Interfaces base
export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface PulseEvent {
  id: string;
  sport: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BetTicket {
  id: string;
  module: ModuleType;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  edge: number;
  stake: number;
  summary: string;
  timestamp: number;
  status: BetStatus;
  isFireSignal?: boolean;
  topProp?: string;
  neuralAnchor?: string;
  expectedMetrics?: any;
  quantumMetrics?: {
    entropy: number;
    blackSwan: number;
    collapsedRealities: number;
  };
}

export interface GlobalIntelligence {
  sport: string;
  league: string;
  avg_efficiency: number;
  sample_size: number;
}

export interface GlobalSummary {
  total_analyses: number;
  success_rate: number;
  system_status: string;
}

export interface StatMetric {
  label: string;
  homeValue: number;
  awayValue: number;
}

export interface TrendPoint {
  time: string;
  value: number;
}

export interface ExplainableEvidence {
  causal: string;
  counterfactual: string;
  philosophical: string;
}

export interface NeuralDebateResult {
  apollo: string;
  cassandra: string;
  socrates: string;
  meta: string;
  finalDecision: boolean;
  neuralAnchor: string;
  confidence: number;
  quantumEntropy: number;
  blackSwanProb: number;
  evidence: ExplainableEvidence;
}

// MatchDashboardData optimizado
export interface MatchDashboardData {
  type: 'MATCH';
  homeTeam: string;
  awayTeam: string;
  leagueName?: string;
  winProbability: number;
  prediction: string;
  edge: number;
  stake: number;
  summary: string;
  stats?: StatMetric[];
  trend?: TrendPoint[];
  recommendedProps: string[];
  isFireSignal?: boolean;
  neuralAnchor?: string;
  quantumEntropy?: number;
  blackSwanProb?: number;
  evidence?: ExplainableEvidence;
  timestamp?: number;
}

export interface BacktestDashboardData {
  type: 'BACKTEST';
  period: string;
  winRate: number;
  totalBets: number;
  totalProfit: number;
  roi: number;
  breakdown: { label: string; value: number }[];
  curve: { time: string; value: number }[];
  strategyAdjustments: string[];
}

export type DashboardData = MatchDashboardData | BacktestDashboardData;

export interface AnalysisMessage extends BaseEntity {
  role: 'user' | 'model' | 'system' | 'agent';
  text: string;
  agent?: AgentType;
  isThinking?: boolean;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
    tokens?: number;
  };
}

export interface GovernanceMetrics {
  reputationScore: number;
  votingPower: number;
  totalProposals: number;
  consensusStrength: number;
}

export interface BetSignal {
  isFireSignal: boolean;
  neuralAnchor: string;
}

// ==================== TIPOS POR DEPORTE (ESPEJOS SQL) ====================

export interface NbaRecommendation {
  id: string; // uuid
  match_info: string;
  team_pick: string;
  spread_line?: number;
  titanium_score?: number; // integer
  is_hook_protected?: boolean;
  is_dynasty_mode?: boolean;
  variance_risk?: string;
  confidence?: number;
  analysis_timestamp?: string; // timestamp without time zone
  status?: string;
}

export interface NflRecommendation {
  id: string; // uuid
  match_info: string;
  prediction_type?: string;
  selection?: string;
  pon_home?: number;
  pdn_home?: number;
  pon_away?: number;
  pdn_away?: number;
  injury_impact_score?: number;
  volatility_alert?: boolean;
  confidence?: number;
  analysis_timestamp?: string; // timestamp without time zone
  status?: string;
}

export interface MlbRecommendation {
  id: string; // uuid
  match_info: string;
  pitcher_matchup?: string;
  fip_score?: number;
  weather_impact?: string;
  bet_type?: string;
  selection?: string;
  confidence?: number;
  analysis_timestamp?: string; // timestamp with time zone
  status?: string;
  created_at?: string; // timestamp with time zone
}

export interface SoccerRecommendation {
  id: string; // uuid
  match_info: string;
  prediction: string;
  confidence_score?: number; // integer in SQL, keeping number for TS
  risk_level?: string;
  protection_ah?: string;
  safe_total?: number;
  atlas_context?: string;
  analysis_timestamp?: string; // timestamp without time zone
  status?: string;
}

// ==================== PROYECCIONES DE JUGADORES POR DEPORTE ====================

export interface NbaPlayerProjection {
  id: string; // uuid
  match_id: string; // uuid
  player_name: string;
  team: string;
  minutes_projected?: number;
  points?: number;
  rebounds?: number;
  assists?: number;
  threes_made?: number;
  fantasy_points?: number;
  created_at?: string;
}

export interface NflPlayerProjection {
  id: string; // uuid
  match_id: string; // uuid
  player_name: string;
  team: string;
  passing_yards?: number;
  rushing_yards?: number;
  receiving_yards?: number;
  touchdowns?: number;
  receptions?: number;
  created_at?: string;
}

export interface MlbPlayerProjection {
  id: string; // uuid
  match_id: string; // uuid
  player_name: string;
  team: string;
  at_bats?: number;
  hits?: number;
  home_runs?: number;
  strikeouts_pitching?: number;
  earned_runs?: number;
  created_at?: string;
}

export interface LmbAnalysis {
  id: string; // uuid
  created_at: string;
  match_date: string; // date
  home_team: string;
  away_team: string;
  home_pitcher?: string;
  away_pitcher?: string;
  venue_city?: string;
  over_under_line?: number;
  prediction_winner?: string;
  prediction_confidence?: number;
  actual_winner?: string;
  status?: string;
  neural_impact_applied?: boolean;
  matices_json?: any; // jsonb
}

export interface NcaaAnalysis {
  id: string; // uuid
  created_at: string;
  match_date: string; // date
  sport_type?: string;
  home_team: string;
  away_team: string;
  home_rank?: number;
  away_rank?: number;
  conference_game?: boolean;
  spread_line?: number;
  prediction_winner?: string;
  actual_winner?: string;
  status?: string;
  edge_percentage?: number;
  scouting_report?: any; // jsonb
}

export interface SoccerAnalysis {
  id: string; // uuid
  created_at: string;
  match_date: string; // date
  league_name: string;
  home_team: string;
  away_team: string;
  prediction_winner?: string;
  actual_winner?: string;
  status?: string;
  edge_percentage?: number;
  scouting_data?: any; // jsonb
}
