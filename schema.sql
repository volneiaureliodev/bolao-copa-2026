-- ================================================================
-- Bolão Copa 2026 – Schema SQL
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ================================================================


-- ================================================================
-- TABELAS
-- ================================================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. games
CREATE TABLE IF NOT EXISTS public.games (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "group"    TEXT,                         -- 'A' … 'L'
    stage      TEXT        NOT NULL DEFAULT 'group',
    team_a     TEXT        NOT NULL,
    team_b     TEXT        NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    venue      TEXT,                         -- Cidade (Estádio)
    status     TEXT        NOT NULL DEFAULT 'upcoming'
                           CHECK (status IN ('upcoming', 'in_progress', 'finished'))
);

-- 3. predictions
CREATE TABLE IF NOT EXISTS public.predictions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id    UUID        NOT NULL REFERENCES public.games(id)    ON DELETE CASCADE,
    score_a    SMALLINT    NOT NULL CHECK (score_a >= 0),
    score_b    SMALLINT    NOT NULL CHECK (score_b >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT predictions_user_game_unique UNIQUE (user_id, game_id)
);

-- auto-update updated_at em predictions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_predictions_updated_at ON public.predictions;
CREATE TRIGGER trg_predictions_updated_at
    BEFORE UPDATE ON public.predictions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. results
CREATE TABLE IF NOT EXISTS public.results (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id     UUID        NOT NULL UNIQUE REFERENCES public.games(id) ON DELETE CASCADE,
    score_a     SMALLINT    NOT NULL CHECK (score_a >= 0),
    score_b     SMALLINT    NOT NULL CHECK (score_b >= 0),
    inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
-- TRIGGER: cria profile automaticamente ao cadastrar usuário
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, nome)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'nome',
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- HELPER: is_admin()
--
-- Para tornar um usuário admin, execute o script create-admin.js
-- ou acesse no Supabase Dashboard:
--   Authentication → Users → [usuário] → Edit → App Metadata
--   e defina: { "role": "admin" }
-- ================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
$$;


-- ================================================================
-- 5. VIEW: scores
--
-- Pontuação por usuário calculada sobre jogos já finalizados:
--   Placar exato         → 5 pontos
--   Resultado certo      → 3 pontos
--   Erro / sem palpite   → 0 pontos
--
-- Desempate: exact_scores desc → correct_winner desc
-- ================================================================
CREATE OR REPLACE VIEW public.scores AS
SELECT
    p.user_id,
    pr.nome,

    COUNT(*) FILTER (
        WHERE r.id IS NOT NULL
          AND p.score_a = r.score_a
          AND p.score_b = r.score_b
    )::INT                                                          AS exact_scores,

    COUNT(*) FILTER (
        WHERE r.id IS NOT NULL
          AND NOT (p.score_a = r.score_a AND p.score_b = r.score_b)
          AND SIGN(p.score_a::INT - p.score_b::INT)
            = SIGN(r.score_a::INT - r.score_b::INT)
    )::INT                                                          AS correct_winner,

    (
        COUNT(*) FILTER (
            WHERE r.id IS NOT NULL
              AND p.score_a = r.score_a
              AND p.score_b = r.score_b
        ) * 5
        +
        COUNT(*) FILTER (
            WHERE r.id IS NOT NULL
              AND NOT (p.score_a = r.score_a AND p.score_b = r.score_b)
              AND SIGN(p.score_a::INT - p.score_b::INT)
                = SIGN(r.score_a::INT - r.score_b::INT)
        ) * 3
    )::INT                                                          AS total_points

FROM      public.predictions p
JOIN      public.profiles    pr ON pr.id     = p.user_id
LEFT JOIN public.results     r  ON r.game_id = p.game_id
GROUP BY  p.user_id, pr.nome;


-- ================================================================
-- 6. ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results     ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────
CREATE POLICY "profiles: leitura pública"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles: usuário insere o próprio"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: usuário atualiza o próprio"
    ON public.profiles FOR UPDATE
    USING     (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ── games ─────────────────────────────────────────────────────
CREATE POLICY "games: leitura pública"
    ON public.games FOR SELECT USING (true);

CREATE POLICY "games: somente admin insere"
    ON public.games FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "games: somente admin atualiza"
    ON public.games FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "games: somente admin deleta"
    ON public.games FOR DELETE
    USING (public.is_admin());

-- ── predictions ───────────────────────────────────────────────
-- Dono vê sempre; todos veem palpites de jogos já encerrados; admin vê tudo
CREATE POLICY "predictions: visibilidade"
    ON public.predictions FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id AND g.status = 'finished'
        )
    );

-- Só pode palpitar antes do início do jogo (o app bloqueia 1h antes via API)
CREATE POLICY "predictions: inserir antes do jogo"
    ON public.predictions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id AND g.match_date > NOW()
        )
    );

-- Só pode alterar antes do início do jogo
CREATE POLICY "predictions: atualizar antes do jogo"
    ON public.predictions FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id AND g.match_date > NOW()
        )
    )
    WITH CHECK (auth.uid() = user_id);

-- Pode deletar antes do início do jogo
CREATE POLICY "predictions: deletar antes do jogo"
    ON public.predictions FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id AND g.match_date > NOW()
        )
    );

-- ── results ───────────────────────────────────────────────────
CREATE POLICY "results: leitura pública"
    ON public.results FOR SELECT USING (true);

CREATE POLICY "results: somente admin insere"
    ON public.results FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "results: somente admin atualiza"
    ON public.results FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "results: somente admin deleta"
    ON public.results FOR DELETE
    USING (public.is_admin());


-- ================================================================
-- GRANTS
-- ================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.games    TO anon, authenticated;
GRANT SELECT ON public.results  TO anon, authenticated;
GRANT SELECT ON public.scores   TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE         ON public.profiles    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictions TO authenticated;


-- ================================================================
-- 7. SEED – 72 jogos oficiais da fase de grupos (Copa 2026)
--
-- Horários em BRT (UTC-3), armazenados como TIMESTAMPTZ
-- Rodada 3: os dois jogos de cada grupo são simultâneos (fair-play)
--
-- Grupos e seleções:
--   A: México · África do Sul · Coreia do Sul · Tchéquia
--   B: Canadá · Bósnia e Herzegovina · Catar · Suíça
--   C: Brasil · Marrocos · Haiti · Escócia
--   D: Estados Unidos · Paraguai · Austrália · Turquia
--   E: Alemanha · Curaçao · Costa do Marfim · Equador
--   F: Holanda · Japão · Suécia · Tunísia
--   G: Bélgica · Egito · Irã · Nova Zelândia
--   H: Espanha · Cabo Verde · Arábia Saudita · Uruguai
--   I: França · Senegal · Iraque · Noruega
--   J: Argentina · Argélia · Áustria · Jordânia
--   K: Portugal · RD Congo · Uzbequistão · Colômbia
--   L: Inglaterra · Croácia · Gana · Panamá
-- ================================================================

INSERT INTO public.games ("group", stage, team_a, team_b, match_date, venue, status) VALUES

-- ──────────────────────────────────────────────────────────────
-- GRUPO A  (México · África do Sul · Coreia do Sul · Tchéquia)
-- ──────────────────────────────────────────────────────────────
('A','group','México',          'África do Sul',        '2026-06-11 16:00:00-03','Cidade do México (Estádio Azteca)',         'upcoming'),
('A','group','Coreia do Sul',   'Tchéquia',             '2026-06-11 23:00:00-03','Guadalajara (Estadio Akron)',               'upcoming'),
('A','group','Tchéquia',        'África do Sul',        '2026-06-18 13:00:00-03','Atlanta (Mercedes-Benz Stadium)',           'upcoming'),
('A','group','México',          'Coreia do Sul',        '2026-06-19 00:00:00-03','Guadalajara (Estadio Akron)',               'upcoming'),
('A','group','Tchéquia',        'México',               '2026-06-25 22:00:00-03','Cidade do México (Estádio Azteca)',         'upcoming'),
('A','group','África do Sul',   'Coreia do Sul',        '2026-06-25 22:00:00-03','Monterrey (Estadio BBVA)',                  'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO B  (Canadá · Bósnia e Herzegovina · Catar · Suíça)
-- ──────────────────────────────────────────────────────────────
('B','group','Canadá',                 'Bósnia e Herzegovina', '2026-06-12 16:00:00-03','Toronto (BMO Field)',                       'upcoming'),
('B','group','Catar',                  'Suíça',                '2026-06-13 16:00:00-03','San Francisco (Levi''s Stadium)',           'upcoming'),
('B','group','Suíça',                  'Bósnia e Herzegovina', '2026-06-18 16:00:00-03','Los Angeles (SoFi Stadium)',                'upcoming'),
('B','group','Canadá',                 'Catar',                '2026-06-18 19:00:00-03','Vancouver (BC Place)',                      'upcoming'),
('B','group','Suíça',                  'Canadá',               '2026-06-24 16:00:00-03','Vancouver (BC Place)',                      'upcoming'),
('B','group','Bósnia e Herzegovina',   'Catar',                '2026-06-24 16:00:00-03','Seattle (Lumen Field)',                     'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO C  (Brasil · Marrocos · Haiti · Escócia)
-- ──────────────────────────────────────────────────────────────
('C','group','Brasil',          'Marrocos',             '2026-06-13 19:00:00-03','Nova York/NJ (MetLife Stadium)',            'upcoming'),
('C','group','Haiti',           'Escócia',              '2026-06-13 22:00:00-03','Boston (Gillette Stadium)',                 'upcoming'),
('C','group','Escócia',         'Marrocos',             '2026-06-19 19:00:00-03','Boston (Gillette Stadium)',                 'upcoming'),
('C','group','Brasil',          'Haiti',                '2026-06-20 22:00:00-03','Filadélfia (Lincoln Financial Field)',      'upcoming'),
('C','group','Escócia',         'Brasil',               '2026-06-24 19:00:00-03','Miami (Hard Rock Stadium)',                 'upcoming'),
('C','group','Marrocos',        'Haiti',                '2026-06-24 19:00:00-03','Atlanta (Mercedes-Benz Stadium)',           'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO D  (Estados Unidos · Paraguai · Austrália · Turquia)
-- ──────────────────────────────────────────────────────────────
('D','group','Estados Unidos',  'Paraguai',             '2026-06-13 22:00:00-03','Los Angeles (SoFi Stadium)',                'upcoming'),
('D','group','Austrália',       'Turquia',              '2026-06-14 01:00:00-03','Vancouver (BC Place)',                      'upcoming'),
('D','group','Estados Unidos',  'Austrália',            '2026-06-19 16:00:00-03','Seattle (Lumen Field)',                     'upcoming'),
('D','group','Turquia',         'Paraguai',             '2026-06-20 01:00:00-03','San Francisco (Levi''s Stadium)',           'upcoming'),
('D','group','Turquia',         'Estados Unidos',       '2026-06-26 23:00:00-03','Los Angeles (SoFi Stadium)',                'upcoming'),
('D','group','Paraguai',        'Austrália',            '2026-06-26 23:00:00-03','San Francisco (Levi''s Stadium)',           'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO E  (Alemanha · Curaçao · Costa do Marfim · Equador)
-- ──────────────────────────────────────────────────────────────
('E','group','Alemanha',        'Curaçao',              '2026-06-14 14:00:00-03','Houston (NRG Stadium)',                     'upcoming'),
('E','group','Costa do Marfim', 'Equador',              '2026-06-14 20:00:00-03','Filadélfia (Lincoln Financial Field)',      'upcoming'),
('E','group','Alemanha',        'Costa do Marfim',      '2026-06-20 17:00:00-03','Toronto (BMO Field)',                       'upcoming'),
('E','group','Equador',         'Curaçao',              '2026-06-20 21:00:00-03','Kansas City (Arrowhead Stadium)',           'upcoming'),
('E','group','Equador',         'Alemanha',             '2026-06-25 17:00:00-03','Nova York/NJ (MetLife Stadium)',            'upcoming'),
('E','group','Curaçao',         'Costa do Marfim',      '2026-06-25 17:00:00-03','Filadélfia (Lincoln Financial Field)',      'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO F  (Holanda · Japão · Suécia · Tunísia)
-- ──────────────────────────────────────────────────────────────
('F','group','Holanda',         'Japão',                '2026-06-14 17:00:00-03','Dallas (AT&T Stadium)',                     'upcoming'),
('F','group','Suécia',          'Tunísia',              '2026-06-14 23:00:00-03','Monterrey (Estadio BBVA)',                  'upcoming'),
('F','group','Holanda',         'Suécia',               '2026-06-20 14:00:00-03','Houston (NRG Stadium)',                     'upcoming'),
('F','group','Tunísia',         'Japão',                '2026-06-21 01:00:00-03','Monterrey (Estadio BBVA)',                  'upcoming'),
('F','group','Japão',           'Suécia',               '2026-06-25 20:00:00-03','Dallas (AT&T Stadium)',                     'upcoming'),
('F','group','Tunísia',         'Holanda',              '2026-06-25 20:00:00-03','Kansas City (Arrowhead Stadium)',           'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO G  (Bélgica · Egito · Irã · Nova Zelândia)
-- ──────────────────────────────────────────────────────────────
('G','group','Bélgica',         'Egito',                '2026-06-15 19:00:00-03','Seattle (Lumen Field)',                     'upcoming'),
('G','group','Irã',             'Nova Zelândia',        '2026-06-16 01:00:00-03','Los Angeles (SoFi Stadium)',                'upcoming'),
('G','group','Bélgica',         'Irã',                  '2026-06-21 16:00:00-03','Los Angeles (SoFi Stadium)',                'upcoming'),
('G','group','Nova Zelândia',   'Egito',                '2026-06-22 22:00:00-03','Vancouver (BC Place)',                      'upcoming'),
('G','group','Egito',           'Irã',                  '2026-06-27 00:00:00-03','Seattle (Lumen Field)',                     'upcoming'),
('G','group','Nova Zelândia',   'Bélgica',              '2026-06-27 00:00:00-03','Vancouver (BC Place)',                      'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO H  (Espanha · Cabo Verde · Arábia Saudita · Uruguai)
-- ──────────────────────────────────────────────────────────────
('H','group','Espanha',         'Cabo Verde',           '2026-06-15 14:00:00-03','Atlanta (Mercedes-Benz Stadium)',           'upcoming'),
('H','group','Arábia Saudita',  'Uruguai',              '2026-06-15 19:00:00-03','Miami (Hard Rock Stadium)',                 'upcoming'),
('H','group','Espanha',         'Arábia Saudita',       '2026-06-21 13:00:00-03','Atlanta (Mercedes-Benz Stadium)',           'upcoming'),
('H','group','Uruguai',         'Cabo Verde',           '2026-06-21 19:00:00-03','Miami (Hard Rock Stadium)',                 'upcoming'),
('H','group','Cabo Verde',      'Arábia Saudita',       '2026-06-26 21:00:00-03','Houston (NRG Stadium)',                     'upcoming'),
('H','group','Uruguai',         'Espanha',              '2026-06-26 21:00:00-03','Guadalajara (Estadio Akron)',               'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO I  (França · Senegal · Iraque · Noruega)
-- ──────────────────────────────────────────────────────────────
('I','group','França',          'Senegal',              '2026-06-16 16:00:00-03','Nova York/NJ (MetLife Stadium)',            'upcoming'),
('I','group','Iraque',          'Noruega',              '2026-06-16 19:00:00-03','Boston (Gillette Stadium)',                 'upcoming'),
('I','group','França',          'Iraque',               '2026-06-22 18:00:00-03','Filadélfia (Lincoln Financial Field)',      'upcoming'),
('I','group','Noruega',         'Senegal',              '2026-06-22 21:00:00-03','Nova York/NJ (MetLife Stadium)',            'upcoming'),
('I','group','Noruega',         'França',               '2026-06-26 16:00:00-03','Boston (Gillette Stadium)',                 'upcoming'),
('I','group','Senegal',         'Iraque',               '2026-06-26 16:00:00-03','Toronto (BMO Field)',                       'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO J  (Argentina · Argélia · Áustria · Jordânia)
-- ──────────────────────────────────────────────────────────────
('J','group','Áustria',         'Jordânia',             '2026-06-17 01:00:00-03','San Francisco (Levi''s Stadium)',           'upcoming'),
('J','group','Argentina',       'Argélia',              '2026-06-17 22:00:00-03','Kansas City (Arrowhead Stadium)',           'upcoming'),
('J','group','Argentina',       'Áustria',              '2026-06-22 14:00:00-03','Dallas (AT&T Stadium)',                     'upcoming'),
('J','group','Jordânia',        'Argélia',              '2026-06-23 00:00:00-03','San Francisco (Levi''s Stadium)',           'upcoming'),
('J','group','Argélia',         'Áustria',              '2026-06-28 23:00:00-03','Kansas City (Arrowhead Stadium)',           'upcoming'),
('J','group','Jordânia',        'Argentina',            '2026-06-28 23:00:00-03','Dallas (AT&T Stadium)',                     'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO K  (Portugal · RD Congo · Uzbequistão · Colômbia)
-- ──────────────────────────────────────────────────────────────
('K','group','Portugal',        'RD Congo',             '2026-06-17 14:00:00-03','Houston (NRG Stadium)',                     'upcoming'),
('K','group','Uzbequistão',     'Colômbia',             '2026-06-17 23:00:00-03','Cidade do México (Estádio Azteca)',         'upcoming'),
('K','group','Portugal',        'Uzbequistão',          '2026-06-23 14:00:00-03','Houston (NRG Stadium)',                     'upcoming'),
('K','group','Colômbia',        'RD Congo',             '2026-06-23 23:00:00-03','Guadalajara (Estadio Akron)',               'upcoming'),
('K','group','Colômbia',        'Portugal',             '2026-06-28 20:30:00-03','Miami (Hard Rock Stadium)',                 'upcoming'),
('K','group','RD Congo',        'Uzbequistão',          '2026-06-28 20:30:00-03','Atlanta (Mercedes-Benz Stadium)',           'upcoming'),

-- ──────────────────────────────────────────────────────────────
-- GRUPO L  (Inglaterra · Croácia · Gana · Panamá)
-- ──────────────────────────────────────────────────────────────
('L','group','Inglaterra',      'Croácia',              '2026-06-17 17:00:00-03','Dallas (AT&T Stadium)',                     'upcoming'),
('L','group','Gana',            'Panamá',               '2026-06-17 20:00:00-03','Toronto (BMO Field)',                       'upcoming'),
('L','group','Inglaterra',      'Gana',                 '2026-06-23 17:00:00-03','Boston (Gillette Stadium)',                 'upcoming'),
('L','group','Panamá',          'Croácia',              '2026-06-23 20:00:00-03','Toronto (BMO Field)',                       'upcoming'),
('L','group','Panamá',          'Inglaterra',           '2026-06-28 18:00:00-03','Nova York/NJ (MetLife Stadium)',            'upcoming'),
('L','group','Croácia',         'Gana',                 '2026-06-28 18:00:00-03','Filadélfia (Lincoln Financial Field)',      'upcoming');
