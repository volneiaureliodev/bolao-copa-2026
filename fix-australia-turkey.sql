-- ================================================================
-- fix-australia-turkey.sql
-- Corrige data do jogo Austrália vs Turquia
-- Data correta: 14/06/2026 às 01h00 BRT (04h00 UTC)
--
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ================================================================

UPDATE public.games
SET match_date = '2026-06-14 01:00:00-03'
WHERE team_a = 'Austrália'
  AND team_b = 'Turquia';

-- Verificação
SELECT
  team_a,
  team_b,
  to_char(match_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS horario_brt,
  venue
FROM public.games
WHERE team_a = 'Austrália' AND team_b = 'Turquia';
