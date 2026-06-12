// Uso: node create-admin.js <email> <senha>
// Lê as variáveis de ambiente do .env.local e cria o usuário admin no Supabase.

const fs = require('fs')
const path = require('path')

// ── Lê .env.local ────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('Erro: arquivo .env.local não encontrado.')
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    env[key] = val
  }
  return env
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const [email, password] = process.argv.slice(2)

  if (!email || !password) {
    console.error('Uso: node create-admin.js <email> <senha>')
    process.exit(1)
  }

  const env = loadEnv()
  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
  const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar preenchidos no .env.local'
    )
    process.exit(1)
  }

  // Importa o cliente Supabase dinamicamente (requer @supabase/supabase-js instalado)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`\nCriando usuário admin: ${email}`)

  // Tenta criar o usuário
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
    user_metadata: { nome: 'Admin' },
  })

  if (createErr) {
    // Se o usuário já existe, atualiza o app_metadata
    if (createErr.message?.includes('already') || createErr.message?.includes('exists')) {
      console.log('Usuário já existe. Buscando pelo e-mail...')

      const { data: list, error: listErr } = await supabase.auth.admin.listUsers()
      if (listErr) { console.error('Erro ao listar usuários:', listErr.message); process.exit(1) }

      const existing = list.users.find((u) => u.email === email)
      if (!existing) { console.error('Usuário não encontrado.'); process.exit(1) }

      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        app_metadata: { role: 'admin' },
      })
      if (updateErr) { console.error('Erro ao atualizar:', updateErr.message); process.exit(1) }

      console.log(`✓ app_metadata atualizado para admin. ID: ${existing.id}`)
    } else {
      console.error('Erro ao criar usuário:', createErr.message)
      process.exit(1)
    }
  } else {
    console.log(`✓ Usuário criado com sucesso. ID: ${created.user.id}`)
    console.log(`✓ app_metadata: ${JSON.stringify(created.user.app_metadata)}`)
  }

  console.log('\n✓ Concluído! Você já pode acessar /admin com esse e-mail e senha.')
  console.log(
    '  Lembre-se de definir NEXT_PUBLIC_ADMIN_EMAIL=' + email + ' no .env.local e na Vercel.\n'
  )
}

main().catch((err) => {
  console.error('Erro inesperado:', err)
  process.exit(1)
})
