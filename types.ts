
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
  SOCRATES = 'SOCRATES',
  AUTONOMOUS = 'AUTONOMOUS'
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
  BLACK_SWAN_SCAN = 'BLACK_SWAN_SCAN',
  LIVE_LINK = 'LIVE_LINK',
  NEURAL_GROUNDING = 'NEURAL_GROUNDING',
  AUTONOMOUS_CYCLE = 'AUTONOMOUS_CYCLE'
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

export interface SystemHealthData {
  status: 'operational' | 'degraded' | 'critical';
  timestamp: string;
  services: {
    supabase: {
      status: 'healthy' | 'error';
      latency?: number;
      error?: string;
    };
  };
  metrics: {
    total_tickets: number;
    pending_tickets: number;
    uptime: number;
  };
}

export interface ExternalWorkflow {
  id: string;
  name: string;
  last_run: string;
  status: 'success' | 'failure' | 'in_progress';
  cron_schedule: string;
  next_run: string;
}

export interface PulseEvent {
  id: string;
  sport: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlayerProp {
  player: string;
  propType: string;
  projection: string;
  confidence: number;
}

export interface StatMetric {
  label: string;
  homeValue: number;
  awayValue: number;
}

export interface ExplainableEvidence {
  causal: string;
  counterfactual: string;
}

export interface NeuralDebateData {
  apollo: string;
  cassandra: string;
  socrates: string;
  meta: {
    score: number;
    verdict: string;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LmbAnalysis {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  home_pitcher: string;
  away_pitcher: string;
  venue_city: string;
  over_under_line: number;
  prediction_winner: string;
  prediction_confidence: number;
  status: string;
  neural_impact_applied: boolean;
  matices_json: any;
  created_at: string;
}

export interface MlbRecommendation {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  home_pitcher: string;
  away_pitcher: string;
  weather_summary: string;
  recommendation: string;
  edge_percentage: number;
  confidence_score: number;
  analysis_timestamp: string;
  is_value_bet: boolean;
}

export interface MlbPlayerProjection {
  id: string;
  match_id: string;
  player_name: string;
  stat_category: string;
  projection_value: number;
  market_line: number;
  confidence_index: number;
  created_at: string;
}

export interface NbaRecommendation {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  recommendation: string;
  edge_percentage: number;
  confidence_score: number;
  analysis_timestamp: string;
  titanium_score: number;
  hook_protection: boolean;
  is_value_bet: boolean;
}

export interface NbaPlayerProjection {
  id: string;
  match_id: string;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  confidence_index: number;
  created_at: string;
}

export interface NflRecommendation {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  recommendation: string;
  edge_percentage: number;
  confidence_score: number;
  analysis_timestamp: string;
  is_value_bet: boolean;
  injury_impact?: string;
  volatility_alert?: string;
}

export interface NflPlayerProjection {
  id: string;
  match_id: string;
  player_name: string;
  passing_yards: number;
  rushing_yards: number;
  touchdowns: number;
  confidence_index: number;
  created_at: string;
}

export interface SoccerRecommendation {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  recommendation: string;
  edge_percentage: number;
  confidence_score: number;
  analysis_timestamp: string;
  is_value_bet: boolean;
  atlas_context?: string;
  safe_totals?: string;
}

export interface MatchDashboardData {
  id: string;
  type: 'MATCH';
  league: string;
  leagueName?: string;
  matchup: string;
  homeTeam: string;
  awayTeam: string;
  projectedWinner: string;
  winnerProbability: number;
  winProbability: number;
  momentumScore: { home: number; away: number };
  playerProps: PlayerProp[];
  recommendedProps?: string[];
  timestamp: number;
  isFireSignal?: boolean;
  edge: number;
  prediction: string;
  summary: string;
  stake: number;
  stats?: StatMetric[];
  quantumEntropy?: number;
  blackSwanProb?: number;
  evidence?: ExplainableEvidence;
  neuralAnchor?: string;
  injuryReport?: string;
  debate?: NeuralDebateData;
  expectedValue?: number;
  marketOdds?: number;
  titaniumScore?: number;
  marketType?: string;
  isNeuralGrounded?: boolean;
  groundingSources?: GroundingSource[];
  intelligenceDepth?: 'SHALLOW' | 'DEEP' | 'ORBITAL';
  lmbContext?: Partial<LmbAnalysis>;
  mlbContext?: Partial<MlbRecommendation>;
  nbaContext?: Partial<NbaRecommendation>;
  nflContext?: Partial<NflRecommendation>;
  soccerContext?: Partial<SoccerRecommendation>;
}

export interface MatchAnalysis extends MatchDashboardData {
  learningRule?: string;
  supabaseJson?: string;
}

export interface BacktestDashboardData {
  type: 'BACKTEST';
  id: string;
  period: string;
  winRate: number;
  totalBets: number;
  totalProfit: number;
  roi: number;
  curve: { value: number }[];
  breakdown: { label: string; value: number }[];
  strategyAdjustments: string[];
  timestamp: number;
}

export type DashboardData = MatchDashboardData | BacktestDashboardData;

export interface BetTicket {
  id: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  edge: number;
  stake: number;
  status: BetStatus;
  module: ModuleType;
  timestamp: number;
  isFireSignal: boolean;
  createdAt?: number;
  summary?: string;
}

export interface AnalysisMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
  isThinking?: boolean;
  agent?: AgentType;
  metadata?: any;
}

export interface MonteCarloResult {
  expectedValue: number;
  variance: number;
  simulations: number;
  distribution: number[];
  winPercentage: number;
  roiProyected: number;
  sharpeRatio: number;
}

export interface GlobalIntelligence {
  id: string;
  topic: string;
  summary: string;
  relevance: number;
}

export interface GlobalSummary {
  dailyYield: number;
  activeSignals: number;
  winRate: number;
}

export interface GovernanceMetrics {
  reputationScore: number;
  votingPower: number;
  totalProposals: number;
  consensusStrength: number;
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
  evidence: {
    causal: string;
    counterfactual: string;
    philosophical: string;
  };
}

export interface AutonomousLog {
  post_mortem: number;
  scouting: number;
  errors: string[];
  timestamp: number;
}
