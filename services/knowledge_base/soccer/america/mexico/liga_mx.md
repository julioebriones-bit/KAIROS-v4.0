# Contexto Estratégico: Liga MX (México) 🇲🇽
**ID Torneo SofaScore:** `129` (Ejemplo)

## 1. Perfil General ("La Liga de las Sorpresas")
*   **Volatilidad:** ALTA. Cualquiera gana a cualquiera. El último lugar suele ganar al primero al menos una vez por torneo.
*   **Factor Localía (Altura):** CRÍTICO.
    *   **CDMX / Toluca / Puebla:** Altura > 2000m. Equipos del llano (Mazatlán, Santos) sufren mucho en 2dos tiempos (Gol late-game).
*   **Estilo Arbitral:**
    *   **VAR:** Intervención excesiva. Promedio de tiempo añadido alto (+7 min por tiempo).
    *   **Tarjetas:** Liga de contacto medio, pero muchas tarjetas por protestas.

## 2. Ajustes de Modelo (Bias)
*   `home_advantage_weight`: 1.25 (Superior al estándar europeo de 1.1).
*   `over_2_5_probability`: ALTA en partidos de liguilla (Playoffs).
*   `btts_bias` (Ambos anotan): ALTO. Defensas suelen ser menos disciplinadas que en Europa.

## 3. Reglas de Negocio (Sniper)
*   **Play-In / Liguilla:** Si hay empate global, la posición en la tabla decide el pase (en cuartos/semis). ¡OJO! A veces el equipo local NO necesita ganar, solo empatar.
    *   *Acción:* No apostar ML al local si el empate le sirve, buscar "Doble Oportunidad".
