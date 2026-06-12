import { createClient } from '@/lib/supabase/server'
import RankingTable from '@/components/RankingTable'
import Link from 'next/link'
import type { Score } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  let user = null
  let scores = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    const { data: s } = await supabase.from('scores').select('*')
    scores = s
  } catch {
    // Supabase não configurado ainda
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-10 bg-gradient-to-br from-green-700 to-green-900 text-white rounded-2xl px-6">
        <h1 className="text-4xl font-extrabold mb-3">⚽ Bolão Copa 2026</h1>
        <p className="text-green-200 mb-6 text-lg">
          Acerte os placares e dispute o título com seus amigos!
        </p>
        {user ? (
          <Link
            href="/palpites"
            className="inline-block bg-yellow-400 text-green-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Ver meus palpites →
          </Link>
        ) : (
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/cadastro"
              className="bg-yellow-400 text-green-900 px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
            >
              Participar
            </Link>
            <Link
              href="/login"
              className="bg-white/20 border border-white/50 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              Entrar
            </Link>
          </div>
        )}
      </section>

      {/* Ranking */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Classificação</h2>
        <RankingTable scores={(scores as Score[]) ?? []} highlightUserId={user?.id} />
      </section>

      {/* Pontuação */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 text-center">Como pontuar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-3xl font-extrabold text-yellow-600 mb-1">5 pts</div>
            <div className="font-semibold text-gray-700">⭐ Placar exato</div>
            <div className="text-gray-400 text-xs mt-1">ex: palpitou 2–1, resultado 2–1</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-3xl font-extrabold text-blue-600 mb-1">3 pts</div>
            <div className="font-semibold text-gray-700">✓ Resultado certo</div>
            <div className="text-gray-400 text-xs mt-1">ex: palpitou 3–0, resultado 2–0</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-3xl font-extrabold text-gray-400 mb-1">0 pts</div>
            <div className="font-semibold text-gray-700">✗ Errou ou não palpitou</div>
            <div className="text-gray-400 text-xs mt-1">resultado diferente do esperado</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Desempate: 1º mais placares exatos · 2º mais resultados corretos
        </p>
      </section>
    </div>
  )
}
