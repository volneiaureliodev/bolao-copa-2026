'use client'
import { useState } from 'react'
import type { GameWithResult, Score, PredictionWithProfile, SyncResult } from '@/lib/types'
import RankingTable from '@/components/RankingTable'
import { formatDate } from '@/lib/utils'

type Props = {
  games: GameWithResult[]
  scores: Score[]
}

type Tab = 'resultados' | 'ranking' | 'palpites' | 'sincronizacao'

export default function AdminClient({ games, scores }: Props) {
  const [tab, setTab] = useState<Tab>('resultados')
  const [gamesState, setGamesState] = useState(games)

  function tabCls(t: Tab) {
    return `px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
      tab === t
        ? 'bg-white border border-b-white text-green-700 -mb-px z-10'
        : 'text-gray-500 hover:text-gray-700'
    }`
  }

  function handleResultSaved(gameId: string, scoreA: number, scoreB: number) {
    setGamesState((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? {
              ...g,
              status: 'finished' as const,
              result: { id: '', game_id: gameId, score_a: scoreA, score_b: scoreB, inserted_at: '' },
            }
          : g
      )
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-0 flex-wrap">
        <button className={tabCls('resultados')} onClick={() => setTab('resultados')}>
          📋 Resultados
        </button>
        <button className={tabCls('ranking')} onClick={() => setTab('ranking')}>
          🏆 Ranking
        </button>
        <button className={tabCls('palpites')} onClick={() => setTab('palpites')}>
          🔍 Palpites por jogo
        </button>
        <button className={tabCls('sincronizacao')} onClick={() => setTab('sincronizacao')}>
          🔄 Sincronização
        </button>
      </div>

      <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl rounded-tr-xl p-6">
        {tab === 'resultados' && (
          <ResultadosTab games={gamesState} onSaved={handleResultSaved} />
        )}
        {tab === 'ranking' && <RankingTable scores={scores} />}
        {tab === 'palpites' && <PalpitesTab games={gamesState} />}
        {tab === 'sincronizacao' && <SincronizacaoTab />}
      </div>
    </div>
  )
}

// ── Resultados Tab ──────────────────────────────────────────────
function ResultadosTab({
  games,
  onSaved,
}: {
  games: GameWithResult[]
  onSaved: (id: string, a: number, b: number) => void
}) {
  const groups: Record<string, GameWithResult[]> = {}
  for (const g of games) {
    const k = g.group ?? g.stage
    if (!groups[k]) groups[k] = []
    groups[k].push(g)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Insira ou edite o resultado de cada jogo. Ao salvar, o status é automaticamente marcado como{' '}
        <strong>Encerrado</strong>.
      </p>
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, groupGames]) => (
          <div key={group}>
            <h3 className="font-bold text-green-700 mb-2">Grupo {group}</h3>
            <div className="space-y-2">
              {groupGames.map((g) => (
                <ResultRow key={g.id} game={g} onSaved={onSaved} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

function ResultRow({
  game,
  onSaved,
}: {
  game: GameWithResult
  onSaved: (id: string, a: number, b: number) => void
}) {
  const [scoreA, setScoreA] = useState(game.result?.score_a?.toString() ?? '')
  const [scoreB, setScoreB] = useState(game.result?.score_b?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSave() {
    const a = parseInt(scoreA)
    const b = parseInt(scoreB)
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
      setErr('Placar inválido')
      return
    }
    setErr(null)
    setSaving(true)
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: game.id, score_a: a, score_b: b }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setErr(data.error ?? 'Erro')
      return
    }
    setOk(true)
    onSaved(game.id, a, b)
    setTimeout(() => setOk(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 flex-wrap">
      <span className="text-xs text-gray-400 w-32 shrink-0">{formatDate(game.match_date)}</span>
      <span className="flex-1 text-sm font-medium min-w-[140px]">
        {game.team_a} × {game.team_b}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={99}
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className="w-10 h-9 text-center border rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min={0}
          max={99}
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className="w-10 h-9 text-center border rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleSave}
          disabled={saving || scoreA === '' || scoreB === ''}
          className="ml-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '…' : ok ? '✓' : game.result ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
      {game.result && (
        <span className="text-xs text-gray-400">
          Atual: {game.result.score_a}–{game.result.score_b}
        </span>
      )}
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  )
}

// ── Palpites Tab ────────────────────────────────────────────────
function PalpitesTab({ games }: { games: GameWithResult[] }) {
  const [selectedId, setSelectedId] = useState('')
  const [predictions, setPredictions] = useState<PredictionWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function loadPredictions(gameId: string) {
    if (!gameId) return
    setSelectedId(gameId)
    setLoading(true)
    setErr(null)
    const res = await fetch(`/api/admin/predictions?game_id=${gameId}`)
    setLoading(false)
    if (!res.ok) {
      setErr('Erro ao carregar palpites')
      return
    }
    setPredictions(await res.json())
  }

  const selectedGame = games.find((g) => g.id === selectedId)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar jogo</label>
        <select
          value={selectedId}
          onChange={(e) => loadPredictions(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">— escolha um jogo —</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              [{g.group}] {g.team_a} × {g.team_b} — {formatDate(g.match_date)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando…</p>}
      {err && <p className="text-sm text-red-500">{err}</p>}

      {predictions.length > 0 && selectedGame && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {selectedGame.team_a} × {selectedGame.team_b} —{' '}
            {selectedGame.result
              ? `Resultado: ${selectedGame.result.score_a}–${selectedGame.result.score_b}`
              : 'Sem resultado ainda'}
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Participante</th>
                  <th className="px-4 py-2 text-center">Palpite</th>
                  {selectedGame.result && (
                    <th className="px-4 py-2 text-center">Pontos</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => {
                  let pts: number | null = null
                  if (selectedGame.result) {
                    if (
                      p.score_a === selectedGame.result.score_a &&
                      p.score_b === selectedGame.result.score_b
                    ) {
                      pts = 5
                    } else if (
                      Math.sign(p.score_a! - p.score_b!) ===
                      Math.sign(selectedGame.result.score_a - selectedGame.result.score_b)
                    ) {
                      pts = 3
                    } else {
                      pts = 0
                    }
                  }
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">{p.profiles?.nome ?? '—'}</td>
                      <td className="px-4 py-2 text-center font-mono font-bold">
                        {p.score_a} – {p.score_b}
                      </td>
                      {selectedGame.result && (
                        <td className="px-4 py-2 text-center">
                          {pts === 5 && <span className="text-yellow-600 font-bold">⭐ 5</span>}
                          {pts === 3 && <span className="text-blue-600 font-semibold">✓ 3</span>}
                          {pts === 0 && <span className="text-gray-400">0</span>}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-1">{predictions.length} palpites registrados</p>
        </div>
      )}

      {!loading && selectedId && predictions.length === 0 && !err && (
        <p className="text-sm text-gray-400">Nenhum palpite registrado para este jogo.</p>
      )}
    </div>
  )
}

// ── Sincronização Tab ───────────────────────────────────────────
function SincronizacaoTab() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      const data: SyncResult = await res.json()
      setResult(data)
    } catch {
      setResult({
        updated: 0,
        log: ['✗ Falha de rede ao chamar a API de sincronização.'],
        timestamp: new Date().toISOString(),
        error: 'network_error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status do cron automático */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-green-800">Sincronização automática ativa</p>
          <p className="text-xs text-green-600">Vercel Cron Jobs — a cada 5 minutos</p>
        </div>
      </div>

      {/* Sincronização manual */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-1">Sincronização manual</h3>
        <p className="text-xs text-gray-400 mb-3">
          Consulta a API-Football agora e atualiza resultados de jogos encerrados.
        </p>
        <button
          onClick={handleSync}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sincronizando…
            </>
          ) : (
            '🔄 Sincronizar Resultados Agora'
          )}
        </button>
      </div>

      {/* Log da última sincronização */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Resultado da sincronização</h3>
            <span className="text-xs text-gray-400">
              {new Date(result.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </span>
          </div>
          <div
            className={`rounded-lg border p-4 font-mono text-sm space-y-0.5 ${
              result.error
                ? 'border-red-200 bg-red-50'
                : result.updated > 0
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {result.log.map((line, i) => (
              <p
                key={i}
                className={
                  line.includes('✓')
                    ? 'text-green-700'
                    : line.includes('✗')
                    ? 'text-red-600'
                    : 'text-gray-600'
                }
              >
                {line}
              </p>
            ))}
          </div>
          {result.updated > 0 && (
            <p className="mt-2 text-sm font-semibold text-green-700">
              {result.updated} resultado(s) salvo(s). Recarregue a página para ver os placar atualizados.
            </p>
          )}
        </div>
      )}

      {/* Notas técnicas */}
      <details className="text-xs text-gray-400 cursor-pointer">
        <summary className="font-medium select-none">ℹ️ Detalhes técnicos</summary>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Fonte: API-Football v3 (RapidAPI) — Liga 1, temporada 2026</li>
          <li>Status aceitos: FT, AET, PEN (90 min após o horário do jogo)</li>
          <li>Plano gratuito: 100 req/dia — suficiente para uso moderado</li>
          <li>Logs do cron disponíveis em: Vercel Dashboard → Logs</li>
        </ul>
      </details>
    </div>
  )
}
