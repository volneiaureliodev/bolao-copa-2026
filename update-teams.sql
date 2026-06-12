-- ================================================================
-- update-teams.sql
-- Corrige os nomes das seleções na tabela public.games
-- para o padrão em Português do Brasil.
--
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- GRUPO A
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'México'          WHERE team_a IN ('Mexico','México'          ) AND team_a != 'México';
UPDATE public.games SET team_b = 'México'          WHERE team_b IN ('Mexico','México'          ) AND team_b != 'México';

UPDATE public.games SET team_a = 'África do Sul'   WHERE team_a IN ('South Africa','Africa do Sul','África do Sul') AND team_a != 'África do Sul';
UPDATE public.games SET team_b = 'África do Sul'   WHERE team_b IN ('South Africa','Africa do Sul','África do Sul') AND team_b != 'África do Sul';

UPDATE public.games SET team_a = 'Coreia do Sul'   WHERE team_a IN ('South Korea','Korea Republic','Coreia do Sul') AND team_a != 'Coreia do Sul';
UPDATE public.games SET team_b = 'Coreia do Sul'   WHERE team_b IN ('South Korea','Korea Republic','Coreia do Sul') AND team_b != 'Coreia do Sul';

UPDATE public.games SET team_a = 'Tchéquia'        WHERE team_a IN ('Czech Republic','Czechia','Tchéquia','Tchecia') AND team_a != 'Tchéquia';
UPDATE public.games SET team_b = 'Tchéquia'        WHERE team_b IN ('Czech Republic','Czechia','Tchéquia','Tchecia') AND team_b != 'Tchéquia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO B
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Canadá'                WHERE team_a IN ('Canada','Canadá') AND team_a != 'Canadá';
UPDATE public.games SET team_b = 'Canadá'                WHERE team_b IN ('Canada','Canadá') AND team_b != 'Canadá';

UPDATE public.games SET team_a = 'Bósnia e Herzegovina' WHERE team_a IN ('Bosnia and Herzegovina','Bosnia & Herzegovina','Bosnia Herzegovina','Bósnia e Herzegovina') AND team_a != 'Bósnia e Herzegovina';
UPDATE public.games SET team_b = 'Bósnia e Herzegovina' WHERE team_b IN ('Bosnia and Herzegovina','Bosnia & Herzegovina','Bosnia Herzegovina','Bósnia e Herzegovina') AND team_b != 'Bósnia e Herzegovina';

UPDATE public.games SET team_a = 'Catar'                WHERE team_a IN ('Qatar','Catar') AND team_a != 'Catar';
UPDATE public.games SET team_b = 'Catar'                WHERE team_b IN ('Qatar','Catar') AND team_b != 'Catar';

UPDATE public.games SET team_a = 'Suíça'                WHERE team_a IN ('Switzerland','Suissa','Suíça') AND team_a != 'Suíça';
UPDATE public.games SET team_b = 'Suíça'                WHERE team_b IN ('Switzerland','Suissa','Suíça') AND team_b != 'Suíça';

-- ──────────────────────────────────────────────────────────────
-- GRUPO C
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Brasil'           WHERE team_a IN ('Brazil','Brasil') AND team_a != 'Brasil';
UPDATE public.games SET team_b = 'Brasil'           WHERE team_b IN ('Brazil','Brasil') AND team_b != 'Brasil';

UPDATE public.games SET team_a = 'Marrocos'         WHERE team_a IN ('Morocco','Marrocos') AND team_a != 'Marrocos';
UPDATE public.games SET team_b = 'Marrocos'         WHERE team_b IN ('Morocco','Marrocos') AND team_b != 'Marrocos';

-- Haiti permanece igual em pt-BR; sem correção necessária

UPDATE public.games SET team_a = 'Escócia'          WHERE team_a IN ('Scotland','Escocia','Escócia') AND team_a != 'Escócia';
UPDATE public.games SET team_b = 'Escócia'          WHERE team_b IN ('Scotland','Escocia','Escócia') AND team_b != 'Escócia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO D
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Estados Unidos'   WHERE team_a IN ('United States','USA','US','Estados Unidos') AND team_a != 'Estados Unidos';
UPDATE public.games SET team_b = 'Estados Unidos'   WHERE team_b IN ('United States','USA','US','Estados Unidos') AND team_b != 'Estados Unidos';

UPDATE public.games SET team_a = 'Paraguai'         WHERE team_a IN ('Paraguay','Paraguai') AND team_a != 'Paraguai';
UPDATE public.games SET team_b = 'Paraguai'         WHERE team_b IN ('Paraguay','Paraguai') AND team_b != 'Paraguai';

UPDATE public.games SET team_a = 'Austrália'        WHERE team_a IN ('Australia','Austrália','Australi') AND team_a != 'Austrália';
UPDATE public.games SET team_b = 'Austrália'        WHERE team_b IN ('Australia','Austrália','Australi') AND team_b != 'Austrália';

UPDATE public.games SET team_a = 'Turquia'          WHERE team_a IN ('Turkey','Türkiye','Turquia') AND team_a != 'Turquia';
UPDATE public.games SET team_b = 'Turquia'          WHERE team_b IN ('Turkey','Türkiye','Turquia') AND team_b != 'Turquia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO E
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Alemanha'         WHERE team_a IN ('Germany','Alemanha') AND team_a != 'Alemanha';
UPDATE public.games SET team_b = 'Alemanha'         WHERE team_b IN ('Germany','Alemanha') AND team_b != 'Alemanha';

UPDATE public.games SET team_a = 'Curaçao'          WHERE team_a IN ('Curacao','Curaçao') AND team_a != 'Curaçao';
UPDATE public.games SET team_b = 'Curaçao'          WHERE team_b IN ('Curacao','Curaçao') AND team_b != 'Curaçao';

UPDATE public.games SET team_a = 'Costa do Marfim'  WHERE team_a IN ('Ivory Coast','Côte d''Ivoire','Cote d''Ivoire','Costa do Marfim') AND team_a != 'Costa do Marfim';
UPDATE public.games SET team_b = 'Costa do Marfim'  WHERE team_b IN ('Ivory Coast','Côte d''Ivoire','Cote d''Ivoire','Costa do Marfim') AND team_b != 'Costa do Marfim';

UPDATE public.games SET team_a = 'Equador'          WHERE team_a IN ('Ecuador','Equador') AND team_a != 'Equador';
UPDATE public.games SET team_b = 'Equador'          WHERE team_b IN ('Ecuador','Equador') AND team_b != 'Equador';

-- ──────────────────────────────────────────────────────────────
-- GRUPO F
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Holanda'          WHERE team_a IN ('Netherlands','Holland','Holanda') AND team_a != 'Holanda';
UPDATE public.games SET team_b = 'Holanda'          WHERE team_b IN ('Netherlands','Holland','Holanda') AND team_b != 'Holanda';

UPDATE public.games SET team_a = 'Japão'            WHERE team_a IN ('Japan','Japao','Japão') AND team_a != 'Japão';
UPDATE public.games SET team_b = 'Japão'            WHERE team_b IN ('Japan','Japao','Japão') AND team_b != 'Japão';

UPDATE public.games SET team_a = 'Suécia'           WHERE team_a IN ('Sweden','Suecia','Suécia') AND team_a != 'Suécia';
UPDATE public.games SET team_b = 'Suécia'           WHERE team_b IN ('Sweden','Suecia','Suécia') AND team_b != 'Suécia';

UPDATE public.games SET team_a = 'Tunísia'          WHERE team_a IN ('Tunisia','Tunisia','Tunísia') AND team_a != 'Tunísia';
UPDATE public.games SET team_b = 'Tunísia'          WHERE team_b IN ('Tunisia','Tunisia','Tunísia') AND team_b != 'Tunísia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO G
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Bélgica'          WHERE team_a IN ('Belgium','Belgica','Bélgica') AND team_a != 'Bélgica';
UPDATE public.games SET team_b = 'Bélgica'          WHERE team_b IN ('Belgium','Belgica','Bélgica') AND team_b != 'Bélgica';

UPDATE public.games SET team_a = 'Egito'            WHERE team_a IN ('Egypt','Egito') AND team_a != 'Egito';
UPDATE public.games SET team_b = 'Egito'            WHERE team_b IN ('Egypt','Egito') AND team_b != 'Egito';

UPDATE public.games SET team_a = 'Irã'              WHERE team_a IN ('Iran','Ira','Irã') AND team_a != 'Irã';
UPDATE public.games SET team_b = 'Irã'              WHERE team_b IN ('Iran','Ira','Irã') AND team_b != 'Irã';

UPDATE public.games SET team_a = 'Nova Zelândia'    WHERE team_a IN ('New Zealand','Nova Zelandia','Nova Zelândia') AND team_a != 'Nova Zelândia';
UPDATE public.games SET team_b = 'Nova Zelândia'    WHERE team_b IN ('New Zealand','Nova Zelandia','Nova Zelândia') AND team_b != 'Nova Zelândia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO H
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Espanha'          WHERE team_a IN ('Spain','Espanha') AND team_a != 'Espanha';
UPDATE public.games SET team_b = 'Espanha'          WHERE team_b IN ('Spain','Espanha') AND team_b != 'Espanha';

UPDATE public.games SET team_a = 'Cabo Verde'       WHERE team_a IN ('Cape Verde','Cabo Verde') AND team_a != 'Cabo Verde';
UPDATE public.games SET team_b = 'Cabo Verde'       WHERE team_b IN ('Cape Verde','Cabo Verde') AND team_b != 'Cabo Verde';

UPDATE public.games SET team_a = 'Arábia Saudita'   WHERE team_a IN ('Saudi Arabia','Arabia Saudita','Arábia Saudita') AND team_a != 'Arábia Saudita';
UPDATE public.games SET team_b = 'Arábia Saudita'   WHERE team_b IN ('Saudi Arabia','Arabia Saudita','Arábia Saudita') AND team_b != 'Arábia Saudita';

UPDATE public.games SET team_a = 'Uruguai'          WHERE team_a IN ('Uruguay','Uruguai') AND team_a != 'Uruguai';
UPDATE public.games SET team_b = 'Uruguai'          WHERE team_b IN ('Uruguay','Uruguai') AND team_b != 'Uruguai';

-- ──────────────────────────────────────────────────────────────
-- GRUPO I
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'França'           WHERE team_a IN ('France','Franca','França') AND team_a != 'França';
UPDATE public.games SET team_b = 'França'           WHERE team_b IN ('France','Franca','França') AND team_b != 'França';

-- Senegal permanece igual em pt-BR; sem correção necessária

UPDATE public.games SET team_a = 'Iraque'           WHERE team_a IN ('Iraq','Iraque') AND team_a != 'Iraque';
UPDATE public.games SET team_b = 'Iraque'           WHERE team_b IN ('Iraq','Iraque') AND team_b != 'Iraque';

UPDATE public.games SET team_a = 'Noruega'          WHERE team_a IN ('Norway','Noruega') AND team_a != 'Noruega';
UPDATE public.games SET team_b = 'Noruega'          WHERE team_b IN ('Norway','Noruega') AND team_b != 'Noruega';

-- ──────────────────────────────────────────────────────────────
-- GRUPO J
-- ──────────────────────────────────────────────────────────────
-- Argentina permanece igual em pt-BR; sem correção necessária

UPDATE public.games SET team_a = 'Argélia'          WHERE team_a IN ('Algeria','Argelia','Argélia') AND team_a != 'Argélia';
UPDATE public.games SET team_b = 'Argélia'          WHERE team_b IN ('Algeria','Argelia','Argélia') AND team_b != 'Argélia';

UPDATE public.games SET team_a = 'Áustria'          WHERE team_a IN ('Austria','Austri','Áustria') AND team_a != 'Áustria';
UPDATE public.games SET team_b = 'Áustria'          WHERE team_b IN ('Austria','Austri','Áustria') AND team_b != 'Áustria';

UPDATE public.games SET team_a = 'Jordânia'         WHERE team_a IN ('Jordan','Jordania','Jordânia') AND team_a != 'Jordânia';
UPDATE public.games SET team_b = 'Jordânia'         WHERE team_b IN ('Jordan','Jordania','Jordânia') AND team_b != 'Jordânia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO K
-- ──────────────────────────────────────────────────────────────
-- Portugal permanece igual em pt-BR; sem correção necessária

UPDATE public.games SET team_a = 'RD Congo'         WHERE team_a IN ('DR Congo','Congo DR','Democratic Republic of Congo','RD Congo') AND team_a != 'RD Congo';
UPDATE public.games SET team_b = 'RD Congo'         WHERE team_b IN ('DR Congo','Congo DR','Democratic Republic of Congo','RD Congo') AND team_b != 'RD Congo';

UPDATE public.games SET team_a = 'Uzbequistão'      WHERE team_a IN ('Uzbekistan','Uzbequistão','Uzbequi') AND team_a != 'Uzbequistão';
UPDATE public.games SET team_b = 'Uzbequistão'      WHERE team_b IN ('Uzbekistan','Uzbequistão','Uzbequi') AND team_b != 'Uzbequistão';

UPDATE public.games SET team_a = 'Colômbia'         WHERE team_a IN ('Colombia','Colombi','Colômbia') AND team_a != 'Colômbia';
UPDATE public.games SET team_b = 'Colômbia'         WHERE team_b IN ('Colombia','Colombi','Colômbia') AND team_b != 'Colômbia';

-- ──────────────────────────────────────────────────────────────
-- GRUPO L
-- ──────────────────────────────────────────────────────────────
UPDATE public.games SET team_a = 'Inglaterra'       WHERE team_a IN ('England','Inglaterra') AND team_a != 'Inglaterra';
UPDATE public.games SET team_b = 'Inglaterra'       WHERE team_b IN ('England','Inglaterra') AND team_b != 'Inglaterra';

UPDATE public.games SET team_a = 'Croácia'          WHERE team_a IN ('Croatia','Croacia','Croácia') AND team_a != 'Croácia';
UPDATE public.games SET team_b = 'Croácia'          WHERE team_b IN ('Croatia','Croacia','Croácia') AND team_b != 'Croácia';

UPDATE public.games SET team_a = 'Gana'             WHERE team_a IN ('Ghana','Gana') AND team_a != 'Gana';
UPDATE public.games SET team_b = 'Gana'             WHERE team_b IN ('Ghana','Gana') AND team_b != 'Gana';

UPDATE public.games SET team_a = 'Panamá'           WHERE team_a IN ('Panama','Panamá') AND team_a != 'Panamá';
UPDATE public.games SET team_b = 'Panamá'           WHERE team_b IN ('Panama','Panamá') AND team_b != 'Panamá';

-- ================================================================
-- Verificação final: lista todos os nomes distintos após a correção
-- ================================================================
SELECT DISTINCT team_a AS selecao FROM public.games
UNION
SELECT DISTINCT team_b        FROM public.games
ORDER BY 1;
