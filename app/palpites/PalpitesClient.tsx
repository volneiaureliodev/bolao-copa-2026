'use client'
import { useState, useCallback } from 'react'
import GameCard from '@/components/GameCard'
import type { GameWithPrediction, Prediction } from '@/lib/types'

type ViewMode = 'grupo' | 'data'
type Props = { games: GameWithPrediction[] }

function dayKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export default function PalpitesClient({ games }: Props) {
  const [state, setState] = useState(games)
  const [view, setView] = useState<ViewMode>('grupo')

  const handleSave = useCallback(async (gameId: string, scoreA: number, scoreB: number) => {
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, score_a: scoreA, score_b: scoreB }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Erro ao salvar')
    }
    const saved: Prediction = await res.json()
    setState((prev) => prev.map((g) => (g.id === gameId ? { ...g, prediction: saved } : g)))
  }, [])

  // Agrupamento por grupo
  const byGroup: Record<string, GameWithPrediction[]> = {}
  for (const g of state) {
    const key = g.group ?? '?'
    if (!byGroup[key]) byGroup[key] = []
    byGroup[key].push(g)
  }

  // Agrupamento por data (ordenado cronologicamente)
  const byDate: Record<string, { label: string; games: GameWithPrediction[] }> = {}
  const sorted = [...state].sort(
    (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  )
  for (const g of sorted) {
    const key = dayKey(g.match_date)
    if (!byDate[key]) byDate[key] = { label: dayLabel(g.match_date), games: [] }
    byDate[key].games.push(g)
  }

  const total = state.length
  const done = state.filter((g) => g.prediction).length

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Meus Palpites</h1>
        <span className="text-sm text-gray-500">{done}/{total} registrados</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      {/* Controles: aviso de bloqueio + toggle de visualização */}
      <div className="flex items-center justify-between gap-4 -mt-2">
        <p className="text-xs text-gray-400">
          🔒 Palpites bloqueados 1h antes do início de cada jogo.
        </p>

        <div className="flex shrink-0 rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setView('grupo')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              view === 'grupo'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Por Grupo
          </button>
          <button
            type="button"
            onClick={() => setView('data')}
            className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
              view === 'data'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Por Data
          </button>
        </div>
      </div>

      {/* Visualização Por Grupo */}
      {view === 'grupo' && (
        <div className="space-y-8">
          {Object.entries(byGroup)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupGames]) => (
              <section key={group}>
                <h2 className="flex items-center gap-2 mb-3">
                  <span className="bg-green-700 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Grupo {group}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupGames.map((game) => (
                    <GameCard key={game.id} game={game} onSave={handleSave} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      {/* Visualização Por Data */}
      {view === 'data' && (
        <div className="space-y-8">
          {Object.entries(byDate).map(([key, { label, games: dayGames }]) => (
            <section key={key}>
              <h2 className="flex items-center gap-2 mb-3">
                <span className="bg-blue-700 text-white text-sm font-bold px-3 py-1 rounded-full capitalize">
                  {label}
                </span>
                <span className="text-xs text-gray-400">
                  {dayGames.length} {dayGames.length === 1 ? 'jogo' : 'jogos'}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dayGames.map((game) => (
                  <GameCard key={game.id} game={game} onSave={handleSave} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
