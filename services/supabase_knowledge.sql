-- ============================================================================
-- KAIROS V2 - LEAGUE KNOWLEDGE BASE (CONTEXT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.league_context (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    sport_key text NOT NULL,        -- Ej: 'soccer_mexico_liga_mx'
    league_name text NOT NULL,       -- Ej: 'Liga MX'
    country text,
    context_rules text,             -- Aquí pegaremos el contenido de los .md
    metadata jsonb DEFAULT '{}'     -- Ajustes de modelo (bias, pesos, etc)
);

-- Habilitar lectura pública
ALTER TABLE public.league_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Context" ON public.league_context FOR SELECT USING (true);

-- INSERTAR EJEMPLO (Liga MX)
INSERT INTO public.league_context (sport_key, league_name, country, context_rules, metadata)
VALUES (
    'soccer_mexico_liga_mx', 
    'Liga MX', 
    'Mexico', 
    'Volatilidad: ALTA. Factor Localía (Altura): CRÍTICO en CDMX/Toluca. VAR: Intervención excesiva. Promedio añadido alto.',
    '{"home_advantage_weight": 1.25, "btts_bias": "high"}'
);
