-- ============================================================================
-- KAIROS V2 - DATABASE ACTIONS (TRIGGERS & FUNCTIONS)
-- ============================================================================
-- Ejecuta este script DESPUÉS de crear las tablas.
-- Esto añade "vida" a la base de datos: actualizaciones automáticas y funciones útiles.

-- ----------------------------------------------------------------------------
-- 1. FUNCIÓN GENÉRICA PARA ACTUALIZAR TIMESTAMP (update_updated_at_column)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. TRIGGERS AUTOMÁTICOS (Disparadores)
-- Cada vez que edites un registro, el campo 'updated_at' (si lo agregas) se actualiza solo.
-- Nota: Las tablas actuales usan 'created_at'. Si decides añadir 'updated_at' después, estos triggers servirán.
-- Por seguridad, definimos triggers para tablas que suelen tener muchas ediciones.
-- ----------------------------------------------------------------------------

-- Ejemplo de cómo añadiríamos la columna primero si no existe (Opcional, pero recomendado para triggers)
-- ALTER TABLE public.nba_recommendations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Trigger para NBA
DROP TRIGGER IF EXISTS update_nba_recommendations_modtime ON public.nba_recommendations;
CREATE TRIGGER update_nba_recommendations_modtime
    BEFORE UPDATE ON public.nba_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para NFL
DROP TRIGGER IF EXISTS update_nfl_recommendations_modtime ON public.nfl_recommendations;
CREATE TRIGGER update_nfl_recommendations_modtime
    BEFORE UPDATE ON public.nfl_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. ACCIONES RPC (Funciones Llamables desde el Frontend/Bot)
-- ----------------------------------------------------------------------------

-- ACCIÓN: Resolver Apuesta (Marcar como Ganada/Perdida y calcular PnL)
-- Uso desde JS: supabase.rpc('resolve_recommendation', { table_name: 'nba', record_id: '...', new_status: 'WON' })
CREATE OR REPLACE FUNCTION resolve_recommendation(
    target_table text,
    record_id uuid,
    new_status text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    sql_query text;
BEGIN
    -- Validar input para evitar inyección simple
    IF target_table NOT IN ('nba', 'nfl', 'mlb', 'soccer', 'lmb') THEN
        RAISE EXCEPTION 'Tabla de deporte no válida';
    END IF;

    -- Construir query dinámico
    sql_query := format('UPDATE public.%I_recommendations SET status = %L, analysis_timestamp = %L WHERE id = %L', 
                        target_table, new_status, now(), record_id);
    
    EXECUTE sql_query;
END;
$$;

-- ACCIÓN: Limpieza de Basura (Borrar predicciones viejas y pendientes que nunca se resolvieron)
-- Útil para mantener la DB ligera.
-- Uso: supabase.rpc('cleanup_old_predictions', { days_older: 7 })
CREATE OR REPLACE FUNCTION cleanup_old_predictions(days_older int)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count int;
    total_deleted int := 0;
BEGIN
    -- Limpiar NBA
    DELETE FROM public.nba_recommendations 
    WHERE created_at < now() - (days_older || ' days')::interval 
    AND status = 'PENDING';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- Limpiar NFL
    DELETE FROM public.nfl_recommendations 
    WHERE created_at < now() - (days_older || ' days')::interval 
    AND status = 'PENDING';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- (Puedes añadir resto de tablas aquí)

    RETURN 'Limpieza completada. Registros eliminados: ' || total_deleted;
END;
$$;

-- ACCIÓN: Resetear Sistema (Solo para Admin/Dev)
-- Borra TODOS los datos de prueba. ¡Cuidado!
CREATE OR REPLACE FUNCTION dangerous_reset_all_data()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    TRUNCATE TABLE public.nba_recommendations;
    TRUNCATE TABLE public.nfl_recommendations;
    TRUNCATE TABLE public.mlb_recommendations;
    TRUNCATE TABLE public.soccer_recommendations;
    TRUNCATE TABLE public.lmb_analysis;
    TRUNCATE TABLE public.nba_player_projections;
    TRUNCATE TABLE public.nfl_player_projections;
    TRUNCATE TABLE public.mlb_player_projections;
    -- No borramos system_health ni rules para no romper la config
END;
$$;
