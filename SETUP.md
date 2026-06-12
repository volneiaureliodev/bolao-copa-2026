# Bolão Copa 2026 — Guia de Configuração

## Pré-requisitos

- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita na [Vercel](https://vercel.com)

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Escolha nome, senha do banco e região (recomendado: **South America — São Paulo**)
3. Aguarde a criação (≈ 1 minuto)

---

## 2. Obter as chaves de API

Em **Settings → API**:

| Variável | Onde encontrar |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` key ⚠️ nunca exponha no front |

---

## 3. Executar o schema no Supabase

1. No painel Supabase, vá em **SQL Editor → New Query**
2. Copie todo o conteúdo de `schema.sql`
3. Cole e clique em **Run** (▶)
4. Verifique que todas as tabelas aparecem em **Table Editor**:
   - `profiles`, `games`, `predictions`, `results`
   - View: `scores`

---

## 4. Configurar variáveis de ambiente locais

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ADMIN_EMAIL=seu@email.com
INVITE_CODE=IPG2026
```

> **`INVITE_CODE`** é o código que os participantes usarão no cadastro.
> O valor padrão é `IPG2026`. Troque se quiser.

---

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 6. Tornar-se administrador

O admin é o usuário cujo e-mail bate com `NEXT_PUBLIC_ADMIN_EMAIL`.

Para liberar a escrita no banco via RLS (a função `is_admin()` checa o JWT):

1. Cadastre sua conta normalmente no app (ou crie via Supabase Dashboard → Authentication → Users)
2. No Supabase Dashboard → **Authentication → Users → [seu usuário] → ⋮ → Edit**
3. Em **App Metadata**, insira:
   ```json
   { "role": "admin" }
   ```
4. Clique em **Save**

Agora você pode acessar `/admin` e inserir resultados.

---

## 7. Configurar autenticação do Supabase

Em **Authentication → Settings**:

- **Site URL**: `http://localhost:3000` (dev) ou sua URL da Vercel (produção)
- **Redirect URLs**: adicione `https://seu-dominio.vercel.app/**`
- Desative **Confirm email** se quiser cadastro imediato sem e-mail de verificação
  (Authentication → Settings → Email → Disable email confirmations)

---

## 8. Deploy na Vercel

### 8.1 Subir o código para o GitHub

```bash
git init
git add .
git commit -m "feat: bolão copa 2026"
git remote add origin https://github.com/SEU_USUARIO/bolao-copa-2026.git
git push -u origin main
```

### 8.2 Criar projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório GitHub
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_ADMIN_EMAIL
INVITE_CODE
```

4. Clique em **Deploy**

### 8.3 Atualizar Site URL no Supabase

Após o deploy, copie a URL da Vercel (ex: `https://bolao-copa-2026.vercel.app`) e:

1. Supabase → **Authentication → Settings → Site URL** → cole a URL
2. Adicione também em **Redirect URLs**

---

## 9. Estrutura das páginas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Página inicial com ranking e regras | Público |
| `/ranking` | Classificação completa | Público |
| `/cadastro` | Criar conta (requer código de convite) | Público |
| `/login` | Entrar | Público |
| `/palpites` | Fazer palpites nos 72 jogos | Logado |
| `/admin` | Painel admin: resultados, ranking, palpites | Admin |

---

## 10. Pontuação

| Resultado | Pontos |
|-----------|--------|
| ⭐ Placar exato | **5 pts** |
| ✓ Vencedor ou empate certo | **3 pts** |
| ✗ Errou ou não palpitou | **0 pts** |

**Desempate:** 1º mais placares exatos · 2º mais resultados corretos

---

## 11. Regras do bolão

- Palpites são **bloqueados 1 hora antes** do início de cada jogo
- Após o bloqueio, não é possível inserir ou alterar palpites
- Os palpites de outros usuários ficam visíveis apenas após o jogo **Encerrado**
- Apenas o admin pode inserir resultados e marcar jogos como encerrados

---

## Problemas comuns

**"Não autorizado" ao salvar resultado**
→ Verifique se o App Metadata do seu usuário contém `{"role":"admin"}`

**Palpites não salvam**
→ Confirme que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos no `.env.local`

**Ranking vazio**
→ A view `scores` só exibe pontuações de jogos com resultado inserido. Insira um resultado via painel admin.

**Erro de CORS ou redirect loop**
→ Atualize Site URL e Redirect URLs em Supabase → Authentication → Settings
