-- ================================================================
-- fix-midnight-games.sql
-- Corrige jogos da madrugada — horários que passam da meia-noite BRT
-- devem estar registrados no dia seguinte em UTC.
--
-- BRT (UTC-3):  01h00 BRT = 04h00 UTC do mesmo dia calendário BRT
--               00h00 BRT = 03h00 UTC do mesmo dia calendário BRT
--
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ================================================================

-- Grupo D — Austrália vs Turquia: 14/06 01h00 BRT = 14/06 04h00 UTC
UPDATE public.games SET match_date = '2026-06-14 04:00:00+00' WHERE team_a = 'Austrália'    AND team_b = 'Turquia';

-- Grupo J — Áustria vs Jordânia: 17/06 01h00 BRT = 17/06 04h00 UTC
UPDATE public.games SET match_date = '2026-06-17 04:00:00+00' WHERE team_a = 'Áustria'      AND team_b = 'Jordânia';

-- Grupo F — Tunísia vs Japão: 21/06 01h00 BRT = 21/06 04h00 UTC
UPDATE public.games SET match_date = '2026-06-21 04:00:00+00' WHERE team_a = 'Tunísia'      AND team_b = 'Japão';

-- Grupo D — Turquia vs Paraguai: 20/06 00h00 BRT = 20/06 03h00 UTC
UPDATE public.games SET match_date = '2026-06-20 03:00:00+00' WHERE team_a = 'Turquia'      AND team_b = 'Paraguai';

-- Grupo J — Jordânia vs Argélia: 23/06 00h00 BRT = 23/06 03h00 UTC
UPDATE public.games SET match_date = '2026-06-23 03:00:00+00' WHERE team_a = 'Jordânia'     AND team_b = 'Argélia';

-- Grupo G — Egito vs Irã: 27/06 00h00 BRT = 27/06 03h00 UTC
UPDATE public.games SET match_date = '2026-06-27 03:00:00+00' WHERE team_a = 'Egito'        AND team_b = 'Irã';

-- Grupo G — Nova Zelândia vs Bélgica: 27/06 00h00 BRT = 27/06 03h00 UTC
UPDATE public.games SET match_date = '2026-06-27 03:00:00+00' WHERE team_a = 'Nova Zelândia' AND team_b = 'Bélgica';

-- ================================================================
-- Verificação: mostra os 7 jogos corrigidos
-- ================================================================
SELECT
  team_a,
  team_b,
  to_char(match_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI') AS horario_brt,
  to_char(match_date, 'DD/MM HH24:MI') AS horario_utc
FROM public.games
WHERE (team_a, team_b) IN (
  ('Austrália',    'Turquia'),
  ('Áustria',      'Jordânia'),
  ('Tunísia',      'Japão'),
  ('Turquia',      'Paraguai'),
  ('Jordânia',     'Argélia'),
  ('Egito',        'Irã'),
  ('Nova Zelândia','Bélgica')
)
ORDER BY match_date;
