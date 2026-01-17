-- ============================================================================
-- KAIROS V2 - SPORTS ANALYSIS SCHEMA
-- ============================================================================
-- Ejecuta este script en el Editor SQL de Supabase para crear todas las tablas necesarias.
-- 
-- TABLAS INCLUIDAS:
-- 1. Recomendaciones por Deporte (NBA, NFL, MLB, Soccer)
-- 2. Proyecciones de Jugadores (NBA, NFL, MLB)
-- 3. Análisis Específicos (LMB)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES DE RECOMENDACIONES (VALUE BETTING CORE)
-- ----------------------------------------------------------------------------

-- 1.1 NBA RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.nba_recommendations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_info text NOT NULL,
    team_pick text,
    spread_line numeric,
    titanium_score integer,         -- Score de valor calculado (EV based)
    is_hook_protected boolean,
    is_dynasty_mode boolean,
    variance_risk text,             -- 'LOW', 'MEDIUM', 'HIGH'
    confidence numeric,             -- Probabilidad calculada (0-100 o 0.0-1.0)
    analysis_timestamp text,        -- Timestamp del análisis
    status text DEFAULT 'PENDING'   -- 'PENDING', 'WON', 'LOST'
);

-- 1.2 NFL RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.nfl_recommendations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_info text NOT NULL,
    prediction_type text,           -- 'SPREAD', 'TOTAL', 'PLAYER_PROP'
    selection text,
    pon_home numeric,               -- Proyección Puntos Home
    pdn_home numeric,               -- Proyección Defensa Home
    pon_away numeric,
    pdn_away numeric,
    injury_impact_score numeric,
    volatility_alert boolean,
    confidence numeric,
    analysis_timestamp text,
    status text DEFAULT 'PENDING'
);

-- 1.3 MLB RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.mlb_recommendations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_info text NOT NULL,
    pitcher_matchup text,
    fip_score numeric,
    weather_impact text,            -- 'CLEAR', 'WIND_OUT', etc.
    bet_type text,
    selection text,
    confidence numeric,
    analysis_timestamp text,
    status text DEFAULT 'PENDING'
);

-- 1.4 SOCCER RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.soccer_recommendations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_info text NOT NULL,
    prediction text,
    confidence_score numeric,
    risk_level text,
    protection_ah text,             -- Asian Handicap Protection (e.g. "0.0", "-0.5")
    safe_total numeric,             -- Línea de gol segura
    atlas_context text,             -- Texto explicativo del análisis
    analysis_timestamp text,
    status text DEFAULT 'PENDING'
);

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE PROYECCIONES DE JUGADORES (PLAYER PROPS)
-- ----------------------------------------------------------------------------

-- 2.1 NBA PLAYER PROJECTIONS
CREATE TABLE IF NOT EXISTS public.nba_player_projections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_id uuid, -- Opcional: Referencia a tabla matches si existe
    player_name text NOT NULL,
    team text,
    minutes_projected numeric,
    points numeric,
    rebounds numeric,
    assists numeric,
    threes_made numeric,
    fantasy_points numeric
);

-- 2.2 NFL PLAYER PROJECTIONS
CREATE TABLE IF NOT EXISTS public.nfl_player_projections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_id uuid,
    player_name text NOT NULL,
    team text,
    passing_yards numeric,
    rushing_yards numeric,
    receiving_yards numeric,
    touchdowns numeric,
    receptions numeric
);

-- 2.3 MLB PLAYER PROJECTIONS
CREATE TABLE IF NOT EXISTS public.mlb_player_projections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_id uuid,
    player_name text NOT NULL,
    team text,
    at_bats numeric,
    hits numeric,
    home_runs numeric,
    strikeouts_pitching numeric,
    earned_runs numeric
);

-- ----------------------------------------------------------------------------
-- 3. ANÁLISIS DE LIGAS ESPECÍFICAS
-- ----------------------------------------------------------------------------

-- 3.1 LMB ANALYSIS (LIGA MEXICANA DE BÉISBOL)
CREATE TABLE IF NOT EXISTS public.lmb_analysis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    match_date date,
    home_team text NOT NULL,
    away_team text NOT NULL,
    home_pitcher text,
    away_pitcher text,
    venue_city text,
    over_under_line numeric,
    prediction_winner text,
    prediction_confidence numeric,
    actual_winner text,
    status text DEFAULT 'SCHEDULED',
    neural_impact_applied boolean,
    matices_json jsonb              -- Factores extra (altitud, clima, etc)
);

-- ----------------------------------------------------------------------------
-- PERMISOS (RLS - Row Level Security)
-- Habilita lectura pública si es necesario, o restringe según tus políticas.
-- Por defecto habilitamos lectura para anon (si tu app lo requiere así).
-- ----------------------------------------------------------------------------

ALTER TABLE public.nba_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read NBA" ON public.nba_recommendations FOR SELECT USING (true);

ALTER TABLE public.nfl_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read NFL" ON public.nfl_recommendations FOR SELECT USING (true);

ALTER TABLE public.mlb_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read MLB" ON public.mlb_recommendations FOR SELECT USING (true);

ALTER TABLE public.soccer_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Soccer" ON public.soccer_recommendations FOR SELECT USING (true);

ALTER TABLE public.lmb_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read LMB" ON public.lmb_analysis FOR SELECT USING (true);

-- Proyecciones
ALTER TABLE public.nba_player_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read NBA Projections" ON public.nba_player_projections FOR SELECT USING (true);

ALTER TABLE public.nfl_player_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read NFL Projections" ON public.nfl_player_projections FOR SELECT USING (true);

ALTER TABLE public.mlb_player_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read MLB Projections" ON public.mlb_player_projections FOR SELECT USING (true);
