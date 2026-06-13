'use client'
import { useState, useEffect } from 'react'
import type { GameWithResult, GameStatus, Score, PredictionWithProfile, SyncResult } from '@/lib/types'
import RankingTable from '@/components/RankingTable'
import { formatDate } from '@/lib/utils'

type Props = {
  games: GameWithResult[]
  scores: Score[]
}

type Tab = 'resultados' | 'editar-jogos' | 'ranking' | 'palpites' | 'sincronizacao'

type ChangeLogEntry = {
  id: string
  ts: string
  game: string
  changes: string
}

// BRT = UTC-3. Converts stored UTC ISO to "YYYY-MM-DDTHH:MM" for datetime-local inputs.
function utcToBrtInput(utcIso: string): string {
  const normalized = utcIso.includes('T') ? utcIso : utcIso.replace(' ', 'T')
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return utcIso.slice(0, 16)
  const brt = new Date(d.getTime() - 3 * 60 * 60 * 1000)
  return brt.toISOString().slice(0, 16)
}

// Treats the datetime-local value as BRT and adds explicit timezone offset.
function brtInputToISO(brtInput: string): string {
  return `${brtInput}:00-03:00`
}

export default function AdminClient({ games, scores }: Props) {
  const [tab, setTab] = useState<Tab>('resultados')
  const [gamesState, setGamesState] = useState(games)
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([])

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

  function handleGameEdited(updated: GameWithResult, changes: string) {
    setGamesState((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    setChangeLog((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        ts: new Date().toISOString(),
        game: `${updated.team_a} × ${updated.team_b}`,
        changes,
      },
      ...prev,
    ])
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-0 flex-wrap">
        <button type="button" className={tabCls('resultados')} onClick={() => setTab('resultados')}>
          📋 Resultados
        </button>
        <button type="button" className={tabCls('editar-jogos')} onClick={() => setTab('editar-jogos')}>
          ✏️ Editar Jogos
        </button>
        <button type="button" className={tabCls('ranking')} onClick={() => setTab('ranking')}>
          🏆 Ranking
        </button>
        <button type="button" className={tabCls('palpites')} onClick={() => setTab('palpites')}>
          🔍 Palpites por jogo
        </button>
        <button type="button" className={tabCls('sincronizacao')} onClick={() => setTab('sincronizacao')}>
          🔄 Sincronização
        </button>
      </div>

      <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl rounded-tr-xl p-6">
        {tab === 'resultados' && (
          <ResultadosTab games={gamesState} onSaved={handleResultSaved} />
        )}
        {tab === 'editar-jogos' && (
          <EditarJogosTab games={gamesState} onSaved={handleGameEdited} />
        )}
        {tab === 'ranking' && <RankingTable scores={scores} />}
        {tab === 'palpites' && <PalpitesTab games={gamesState} />}
        {tab === 'sincronizacao' && <SincronizacaoTab />}
      </div>

      {changeLog.length > 0 && <ChangeLogSection entries={changeLog} />}
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
          aria-label={`Gols ${game.team_a}`}
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className="w-10 h-9 text-center border rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min={0}
          max={99}
          aria-label={`Gols ${game.team_b}`}
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className="w-10 h-9 text-center border rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="button"
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

// ── Editar Jogos Tab ────────────────────────────────────────────
function EditarJogosTab({
  games,
  onSaved,
}: {
  games: GameWithResult[]
  onSaved: (updated: GameWithResult, changes: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = games.filter((g) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      g.team_a.toLowerCase().includes(q) ||
      g.team_b.toLowerCase().includes(q) ||
      (g.group ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Corrija data/horário, times, grupo, sede ou status de qualquer jogo. As alterações ficam registradas
        no log abaixo.
      </p>
      <input
        type="text"
        placeholder="Filtrar por time ou grupo…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="space-y-1.5">
        {filtered.map((game) => (
          <GameEditRow
            key={game.id}
            game={game}
            isEditing={editingId === game.id}
            onEdit={() => setEditingId(editingId === game.id ? null : game.id)}
            onCancel={() => setEditingId(null)}
            onSaved={(updated, changes) => {
              setEditingId(null)
              onSaved(updated, changes)
            }}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum jogo encontrado.</p>
        )}
      </div>
    </div>
  )
}

function GameEditRow({
  game,
  isEditing,
  onEdit,
  onCancel,
  onSaved,
}: {
  game: GameWithResult
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSaved: (updated: GameWithResult, changes: string) => void
}) {
  const [teamA, setTeamA] = useState(game.team_a)
  const [teamB, setTeamB] = useState(game.team_b)
  const [group, setGroup] = useState(game.group ?? '')
  const [venue, setVenue] = useState(game.venue ?? '')
  const [matchDate, setMatchDate] = useState(utcToBrtInput(game.match_date))
  const [status, setStatus] = useState<GameStatus>(game.status)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Reset form when the edit panel opens
  useEffect(() => {
    if (isEditing) {
      setTeamA(game.team_a)
      setTeamB(game.team_b)
      setGroup(game.group ?? '')
      setVenue(game.venue ?? '')
      setMatchDate(utcToBrtInput(game.match_date))
      setStatus(game.status)
      setErr(null)
    }
  }, [isEditing, game])

  async function handleSave() {
    setSaving(true)
    setErr(null)

    const isoDate = brtInputToISO(matchDate)
    const originalBrt = utcToBrtInput(game.match_date)
    const changes: string[] = []
    if (teamA !== game.team_a) changes.push(`Time A: "${game.team_a}" → "${teamA}"`)
    if (teamB !== game.team_b) changes.push(`Time B: "${game.team_b}" → "${teamB}"`)
    if (group !== (game.group ?? '')) changes.push(`Grupo: "${game.group ?? '?'}" → "${group}"`)
    if (venue !== (game.venue ?? '')) changes.push(`Sede alterada`)
    if (matchDate !== originalBrt)
      changes.push(`Data: "${originalBrt} BRT" → "${matchDate} BRT"`)
    if (status !== game.status) changes.push(`Status: "${game.status}" → "${status}"`)

    if (changes.length === 0) {
      onCancel()
      setSaving(false)
      return
    }

    const res = await fetch(`/api/admin/games/${game.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_a: teamA,
        team_b: teamB,
        group,
        venue,
        match_date: isoDate,
        status,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setErr(data.error ?? 'Erro ao salvar')
      return
    }
    const updated = await res.json()
    onSaved({ ...game, ...updated }, changes.join(' | '))
  }

  const statusColors: Record<GameStatus, string> = {
    upcoming: 'bg-blue-50 text-blue-600',
    in_progress: 'bg-yellow-100 text-yellow-700',
    finished: 'bg-gray-200 text-gray-600',
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 flex-wrap">
        <span className="text-xs text-gray-400 w-32 shrink-0">{formatDate(game.match_date)}</span>
        <span className="flex-1 text-sm font-medium min-w-[160px]">
          {game.team_a} × {game.team_b}
        </span>
        <span className="text-xs text-gray-400">Gr.&nbsp;{game.group}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColors[game.status]}`}>
          {game.status}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors shrink-0"
        >
          {isEditing ? '▲ Fechar' : '✏️ Editar'}
        </button>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Time A</span>
              <input
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Time B</span>
              <input
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Data/Hora — horário de Brasília</span>
              <input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Grupo</span>
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                maxLength={2}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-gray-500 mb-1 block">Sede</span>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GameStatus)}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="upcoming">upcoming</option>
                <option value="in_progress">in_progress</option>
                <option value="finished">finished</option>
              </select>
            </label>
          </div>

          {err && <p className="text-xs text-red-500 mt-2">{err}</p>}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando…' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 text-xs px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
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
          title="Selecionar jogo para ver palpites"
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
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-green-800">Sincronização automática ativa</p>
          <p className="text-xs text-green-600">GitHub Actions — a cada hora</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-1">Sincronização manual</h3>
        <p className="text-xs text-gray-400 mb-3">
          Consulta a API-Football agora e atualiza resultados de jogos encerrados.
        </p>
        <button
          type="button"
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
                  line.includes('✓') ? 'text-green-700' : line.includes('✗') ? 'text-red-600' : 'text-gray-600'
                }
              >
                {line}
              </p>
            ))}
          </div>
          {result.updated > 0 && (
            <p className="mt-2 text-sm font-semibold text-green-700">
              {result.updated} resultado(s) salvo(s). Recarregue a página para ver os placares atualizados.
            </p>
          )}
        </div>
      )}

      <details className="text-xs text-gray-400 cursor-pointer">
        <summary className="font-medium select-none">ℹ️ Detalhes técnicos</summary>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Fonte: API-Football v3 (api-sports.io) — Liga 1, temporada 2026</li>
          <li>Status aceitos: FT, AET, PEN (100 min após o horário do jogo)</li>
          <li>Plano gratuito: 100 req/dia — suficiente para uso moderado</li>
          <li>Logs: GitHub Actions → Sync Football Results</li>
        </ul>
      </details>
    </div>
  )
}

// ── Change Log ──────────────────────────────────────────────────
function ChangeLogSection({ entries }: { entries: ChangeLogEntry[] }) {
  return (
    <div className="mt-4 border border-yellow-200 rounded-xl bg-yellow-50 p-4">
      <h3 className="text-sm font-semibold text-yellow-800 mb-2">
        📝 Alterações desta sessão ({entries.length})
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {entries.map((e) => (
          <div
            key={e.id}
            className="text-xs bg-white border border-yellow-100 rounded px-3 py-1.5 flex flex-wrap gap-x-2 gap-y-0.5"
          >
            <span className="text-gray-400 shrink-0 font-mono">
              {new Date(e.ts).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="font-semibold text-gray-700">{e.game}</span>
            <span className="text-gray-500">—</span>
            <span className="text-gray-600">{e.changes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
