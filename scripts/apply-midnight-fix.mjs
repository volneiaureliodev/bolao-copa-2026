// apply-midnight-fix.mjs — aplica fix-midnight-games.sql via Supabase JS client
// Uso: node scripts/apply-midnight-fix.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const fixes = [
  { team_a: 'Austrália',     team_b: 'Turquia',     match_date: '2026-06-14T04:00:00+00:00', note: '14/06 01h BRT' },
  { team_a: 'Áustria',       team_b: 'Jordânia',    match_date: '2026-06-17T04:00:00+00:00', note: '17/06 01h BRT' },
  { team_a: 'Tunísia',       team_b: 'Japão',       match_date: '2026-06-21T04:00:00+00:00', note: '21/06 01h BRT' },
  { team_a: 'Turquia',       team_b: 'Paraguai',    match_date: '2026-06-20T03:00:00+00:00', note: '20/06 00h BRT' },
  { team_a: 'Jordânia',      team_b: 'Argélia',     match_date: '2026-06-23T03:00:00+00:00', note: '23/06 00h BRT' },
  { team_a: 'Egito',         team_b: 'Irã',         match_date: '2026-06-27T03:00:00+00:00', note: '27/06 00h BRT' },
  { team_a: 'Nova Zelândia', team_b: 'Bélgica',     match_date: '2026-06-27T03:00:00+00:00', note: '27/06 00h BRT' },
]

console.log('Aplicando correções de datas da madrugada…\n')
let ok = 0
for (const f of fixes) {
  const { error } = await supabase
    .from('games')
    .update({ match_date: f.match_date })
    .eq('team_a', f.team_a)
    .eq('team_b', f.team_b)

  if (error) {
    console.error(`✗  ${f.team_a} × ${f.team_b}: ${error.message}`)
  } else {
    console.log(`✓  ${f.team_a} × ${f.team_b} → ${f.note}`)
    ok++
  }
}
console.log(`\n${ok}/${fixes.length} atualizações concluídas.`)
