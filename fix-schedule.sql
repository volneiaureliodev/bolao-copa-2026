-- ================================================================
-- fix-schedule.sql
-- Corrige datas/horários e sedes dos 72 jogos da fase de grupos
-- conforme calendário oficial FIFA — horário de Brasília (BRT = UTC-3)
--
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- 1ª RODADA
-- ──────────────────────────────────────────────────────────────

-- Grupo A
UPDATE public.games SET match_date = '2026-06-11 16:00:00-03', venue = 'Cidade do México (Estádio Azteca)'    WHERE team_a = 'México'                AND team_b = 'África do Sul';
UPDATE public.games SET match_date = '2026-06-11 23:00:00-03', venue = 'Guadalajara (Estadio Akron)'          WHERE team_a = 'Coreia do Sul'         AND team_b = 'Tchéquia';

-- Grupo B
UPDATE public.games SET match_date = '2026-06-12 16:00:00-03', venue = 'Toronto (BMO Field)'                  WHERE team_a = 'Canadá'                AND team_b = 'Bósnia e Herzegovina';
UPDATE public.games SET match_date = '2026-06-13 16:00:00-03', venue = 'San Francisco (Levi''s Stadium)'      WHERE team_a = 'Catar'                 AND team_b = 'Suíça';

-- Grupo C
UPDATE public.games SET match_date = '2026-06-13 19:00:00-03', venue = 'Nova York/NJ (MetLife Stadium)'       WHERE team_a = 'Brasil'                AND team_b = 'Marrocos';
UPDATE public.games SET match_date = '2026-06-13 22:00:00-03', venue = 'Boston (Gillette Stadium)'            WHERE team_a = 'Haiti'                 AND team_b = 'Escócia';

-- Grupo D
UPDATE public.games SET match_date = '2026-06-12 22:00:00-03', venue = 'Los Angeles (SoFi Stadium)'           WHERE team_a = 'Estados Unidos'        AND team_b = 'Paraguai';
UPDATE public.games SET match_date = '2026-06-13 01:00:00-03', venue = 'Vancouver (BC Place)'                 WHERE team_a = 'Austrália'             AND team_b = 'Turquia';

-- Grupo E
UPDATE public.games SET match_date = '2026-06-14 14:00:00-03', venue = 'Houston (NRG Stadium)'                WHERE team_a = 'Alemanha'              AND team_b = 'Curaçao';
UPDATE public.games SET match_date = '2026-06-14 20:00:00-03', venue = 'Filadélfia (Lincoln Financial Field)' WHERE team_a = 'Costa do Marfim'       AND team_b = 'Equador';

-- Grupo F
UPDATE public.games SET match_date = '2026-06-14 17:00:00-03', venue = 'Dallas (AT&T Stadium)'                WHERE team_a = 'Holanda'               AND team_b = 'Japão';
UPDATE public.games SET match_date = '2026-06-14 23:00:00-03', venue = 'Monterrey (Estadio BBVA)'             WHERE team_a = 'Suécia'                AND team_b = 'Tunísia';

-- Grupo G
UPDATE public.games SET match_date = '2026-06-15 16:00:00-03', venue = 'Seattle (Lumen Field)'                WHERE team_a = 'Bélgica'               AND team_b = 'Egito';
UPDATE public.games SET match_date = '2026-06-15 22:00:00-03', venue = 'Los Angeles (SoFi Stadium)'           WHERE team_a = 'Irã'                   AND team_b = 'Nova Zelândia';

-- Grupo H
UPDATE public.games SET match_date = '2026-06-15 13:00:00-03', venue = 'Atlanta (Mercedes-Benz Stadium)'      WHERE team_a = 'Espanha'               AND team_b = 'Cabo Verde';
UPDATE public.games SET match_date = '2026-06-15 19:00:00-03', venue = 'Miami (Hard Rock Stadium)'            WHERE team_a = 'Arábia Saudita'        AND team_b = 'Uruguai';

-- Grupo I
UPDATE public.games SET match_date = '2026-06-16 16:00:00-03', venue = 'Nova York/NJ (MetLife Stadium)'       WHERE team_a = 'França'                AND team_b = 'Senegal';
UPDATE public.games SET match_date = '2026-06-16 19:00:00-03', venue = 'Boston (Gillette Stadium)'            WHERE team_a = 'Iraque'                AND team_b = 'Noruega';

-- Grupo J
UPDATE public.games SET match_date = '2026-06-16 22:00:00-03', venue = 'Kansas City (Arrowhead Stadium)'      WHERE team_a = 'Argentina'             AND team_b = 'Argélia';
UPDATE public.games SET match_date = '2026-06-17 01:00:00-03', venue = 'San Francisco (Levi''s Stadium)'      WHERE team_a = 'Áustria'               AND team_b = 'Jordânia';

-- Grupo K
UPDATE public.games SET match_date = '2026-06-17 14:00:00-03', venue = 'Houston (NRG Stadium)'                WHERE team_a = 'Portugal'              AND team_b = 'RD Congo';
UPDATE public.games SET match_date = '2026-06-17 23:00:00-03', venue = 'Cidade do México (Estádio Azteca)'    WHERE team_a = 'Uzbequistão'           AND team_b = 'Colômbia';

-- Grupo L
UPDATE public.games SET match_date = '2026-06-17 17:00:00-03', venue = 'Dallas (AT&T Stadium)'                WHERE team_a = 'Inglaterra'            AND team_b = 'Croácia';
UPDATE public.games SET match_date = '2026-06-17 20:00:00-03', venue = 'Toronto (BMO Field)'                  WHERE team_a = 'Gana'                  AND team_b = 'Panamá';

-- ──────────────────────────────────────────────────────────────
-- 2ª RODADA
-- ──────────────────────────────────────────────────────────────

-- Grupo A
UPDATE public.games SET match_date = '2026-06-18 13:00:00-03', venue = 'Atlanta (Mercedes-Benz Stadium)'      WHERE team_a = 'Tchéquia'              AND team_b = 'África do Sul';
UPDATE public.games SET match_date = '2026-06-18 22:00:00-03', venue = 'Guadalajara (Estadio Akron)'          WHERE team_a = 'México'                AND team_b = 'Coreia do Sul';

-- Grupo B
UPDATE public.games SET match_date = '2026-06-18 16:00:00-03', venue = 'Los Angeles (SoFi Stadium)'           WHERE team_a = 'Suíça'                 AND team_b = 'Bósnia e Herzegovina';
UPDATE public.games SET match_date = '2026-06-18 19:00:00-03', venue = 'Vancouver (BC Place)'                 WHERE team_a = 'Canadá'                AND team_b = 'Catar';

-- Grupo C
UPDATE public.games SET match_date = '2026-06-19 19:00:00-03', venue = 'Boston (Gillette Stadium)'            WHERE team_a = 'Escócia'               AND team_b = 'Marrocos';
UPDATE public.games SET match_date = '2026-06-19 21:30:00-03', venue = 'Filadélfia (Lincoln Financial Field)' WHERE team_a = 'Brasil'                AND team_b = 'Haiti';

-- Grupo D
UPDATE public.games SET match_date = '2026-06-19 16:00:00-03', venue = 'Seattle (Lumen Field)'                WHERE team_a = 'Estados Unidos'        AND team_b = 'Austrália';
UPDATE public.games SET match_date = '2026-06-20 00:00:00-03', venue = 'San Francisco (Levi''s Stadium)'      WHERE team_a = 'Turquia'               AND team_b = 'Paraguai';

-- Grupo E
UPDATE public.games SET match_date = '2026-06-20 17:00:00-03', venue = 'Toronto (BMO Field)'                  WHERE team_a = 'Alemanha'              AND team_b = 'Costa do Marfim';
UPDATE public.games SET match_date = '2026-06-20 21:00:00-03', venue = 'Kansas City (Arrowhead Stadium)'      WHERE team_a = 'Equador'               AND team_b = 'Curaçao';

-- Grupo F
UPDATE public.games SET match_date = '2026-06-20 14:00:00-03', venue = 'Houston (NRG Stadium)'                WHERE team_a = 'Holanda'               AND team_b = 'Suécia';
UPDATE public.games SET match_date = '2026-06-21 01:00:00-03', venue = 'Monterrey (Estadio BBVA)'             WHERE team_a = 'Tunísia'               AND team_b = 'Japão';

-- Grupo G
UPDATE public.games SET match_date = '2026-06-21 16:00:00-03', venue = 'Los Angeles (SoFi Stadium)'           WHERE team_a = 'Bélgica'               AND team_b = 'Irã';
UPDATE public.games SET match_date = '2026-06-21 22:00:00-03', venue = 'Vancouver (BC Place)'                 WHERE team_a = 'Nova Zelândia'         AND team_b = 'Egito';

-- Grupo H
UPDATE public.games SET match_date = '2026-06-21 13:00:00-03', venue = 'Atlanta (Mercedes-Benz Stadium)'      WHERE team_a = 'Espanha'               AND team_b = 'Arábia Saudita';
UPDATE public.games SET match_date = '2026-06-21 19:00:00-03', venue = 'Miami (Hard Rock Stadium)'            WHERE team_a = 'Uruguai'               AND team_b = 'Cabo Verde';

-- Grupo I
UPDATE public.games SET match_date = '2026-06-22 18:00:00-03', venue = 'Filadélfia (Lincoln Financial Field)' WHERE team_a = 'França'                AND team_b = 'Iraque';
UPDATE public.games SET match_date = '2026-06-22 21:00:00-03', venue = 'Nova York/NJ (MetLife Stadium)'       WHERE team_a = 'Noruega'               AND team_b = 'Senegal';

-- Grupo J
UPDATE public.games SET match_date = '2026-06-22 14:00:00-03', venue = 'Dallas (AT&T Stadium)'                WHERE team_a = 'Argentina'             AND team_b = 'Áustria';
UPDATE public.games SET match_date = '2026-06-23 00:00:00-03', venue = 'San Francisco (Levi''s Stadium)'      WHERE team_a = 'Jordânia'              AND team_b = 'Argélia';

-- Grupo K
UPDATE public.games SET match_date = '2026-06-23 14:00:00-03', venue = 'Houston (NRG Stadium)'                WHERE team_a = 'Portugal'              AND team_b = 'Uzbequistão';
UPDATE public.games SET match_date = '2026-06-23 23:00:00-03', venue = 'Guadalajara (Estadio Akron)'          WHERE team_a = 'Colômbia'              AND team_b = 'RD Congo';

-- Grupo L
UPDATE public.games SET match_date = '2026-06-23 17:00:00-03', venue = 'Boston (Gillette Stadium)'            WHERE team_a = 'Inglaterra'            AND team_b = 'Gana';
UPDATE public.games SET match_date = '2026-06-23 20:00:00-03', venue = 'Toronto (BMO Field)'                  WHERE team_a = 'Panamá'                AND team_b = 'Croácia';

-- ──────────────────────────────────────────────────────────────
-- 3ª RODADA  (jogos simultâneos por grupo)
-- ──────────────────────────────────────────────────────────────

-- Grupo A (simultâneos 24/06 22h00)
UPDATE public.games SET match_date = '2026-06-24 22:00:00-03', venue = 'Cidade do México (Estádio Azteca)'    WHERE team_a = 'Tchéquia'              AND team_b = 'México';
UPDATE public.games SET match_date = '2026-06-24 22:00:00-03', venue = 'Monterrey (Estadio BBVA)'             WHERE team_a = 'África do Sul'         AND team_b = 'Coreia do Sul';

-- Grupo B (simultâneos 24/06 16h00)
UPDATE public.games SET match_date = '2026-06-24 16:00:00-03', venue = 'Vancouver (BC Place)'                 WHERE team_a = 'Suíça'                 AND team_b = 'Canadá';
UPDATE public.games SET match_date = '2026-06-24 16:00:00-03', venue = 'Seattle (Lumen Field)'                WHERE team_a = 'Bósnia e Herzegovina'  AND team_b = 'Catar';

-- Grupo C (simultâneos 24/06 19h00)
UPDATE public.games SET match_date = '2026-06-24 19:00:00-03', venue = 'Miami (Hard Rock Stadium)'            WHERE team_a = 'Escócia'               AND team_b = 'Brasil';
UPDATE public.games SET match_date = '2026-06-24 19:00:00-03', venue = 'Atlanta (Mercedes-Benz Stadium)'      WHERE team_a = 'Marrocos'              AND team_b = 'Haiti';

-- Grupo D (simultâneos 25/06 23h00)
UPDATE public.games SET match_date = '2026-06-25 23:00:00-03', venue = 'Los Angeles (SoFi Stadium)'           WHERE team_a = 'Turquia'               AND team_b = 'Estados Unidos';
UPDATE public.games SET match_date = '2026-06-25 23:00:00-03', venue = 'San Francisco (Levi''s Stadium)'      WHERE team_a = 'Paraguai'              AND team_b = 'Austrália';

-- Grupo E (simultâneos 25/06 17h00)
UPDATE public.games SET match_date = '2026-06-25 17:00:00-03', venue = 'Filadélfia (Lincoln Financial Field)' WHERE team_a = 'Curaçao'               AND team_b = 'Costa do Marfim';
UPDATE public.games SET match_date = '2026-06-25 17:00:00-03', venue = 'Nova York/NJ (MetLife Stadium)'       WHERE team_a = 'Equador'               AND team_b = 'Alemanha';

-- Grupo F (simultâneos 25/06 20h00)
UPDATE public.games SET match_date = '2026-06-25 20:00:00-03', venue = 'Dallas (AT&T Stadium)'                WHERE team_a = 'Japão'                 AND team_b = 'Suécia';
UPDATE public.games SET match_date = '2026-06-25 20:00:00-03', venue = 'Kansas City (Arrowhead Stadium)'      WHERE team_a = 'Tunísia'               AND team_b = 'Holanda';

-- Grupo G (simultâneos 27/06 00h00)
UPDATE public.games SET match_date = '2026-06-27 00:00:00-03', venue = 'Seattle (Lumen Field)'                WHERE team_a = 'Egito'                 AND team_b = 'Irã';
UPDATE public.games SET match_date = '2026-06-27 00:00:00-03', venue = 'Vancouver (BC Place)'                 WHERE team_a = 'Nova Zelândia'         AND team_b = 'Bélgica';

-- Grupo H (simultâneos 26/06 21h00)
UPDATE public.games SET match_date = '2026-06-26 21:00:00-03', venue = 'Houston (NRG Stadium)'                WHERE team_a = 'Cabo Verde'            AND team_b = 'Arábia Saudita';
UPDATE public.games SET match_date = '2026-06-26 21:00:00-03', venue = 'Guadalajara (Estadio Akron)'          WHERE team_a = 'Uruguai'               AND team_b = 'Espanha';

-- Grupo I (simultâneos 26/06 16h00)
UPDATE public.games SET match_date = '2026-06-26 16:00:00-03', venue = 'Boston (Gillette Stadium)'            WHERE team_a = 'Noruega'               AND team_b = 'França';
UPDATE public.games SET match_date = '2026-06-26 16:00:00-03', venue = 'Toronto (BMO Field)'                  WHERE team_a = 'Senegal'               AND team_b = 'Iraque';

-- Grupo J (simultâneos 27/06 23h00)
UPDATE public.games SET match_date = '2026-06-27 23:00:00-03', venue = 'Kansas City (Arrowhead Stadium)'      WHERE team_a = 'Argélia'               AND team_b = 'Áustria';
UPDATE public.games SET match_date = '2026-06-27 23:00:00-03', venue = 'Dallas (AT&T Stadium)'                WHERE team_a = 'Jordânia'              AND team_b = 'Argentina';

-- Grupo K (simultâneos 27/06 20h30)
UPDATE public.games SET match_date = '2026-06-27 20:30:00-03', venue = 'Miami (Hard Rock Stadium)'            WHERE team_a = 'Colômbia'              AND team_b = 'Portugal';
UPDATE public.games SET match_date = '2026-06-27 20:30:00-03', venue = 'Atlanta (Mercedes-Benz Stadium)'      WHERE team_a = 'RD Congo'              AND team_b = 'Uzbequistão';

-- Grupo L (simultâneos 27/06 18h00)
UPDATE public.games SET match_date = '2026-06-27 18:00:00-03', venue = 'Nova York/NJ (MetLife Stadium)'       WHERE team_a = 'Panamá'                AND team_b = 'Inglaterra';
UPDATE public.games SET match_date = '2026-06-27 18:00:00-03', venue = 'Filadélfia (Lincoln Financial Field)' WHERE team_a = 'Croácia'               AND team_b = 'Gana';

-- ================================================================
-- Verificação: total de jogos por data (deve mostrar 72 linhas únicas)
-- ================================================================
SELECT
  to_char(match_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM (Dy) HH24:MI') AS horario_brt,
  "group" AS grp,
  team_a,
  team_b,
  venue
FROM public.games
WHERE stage = 'group'
ORDER BY match_date;
