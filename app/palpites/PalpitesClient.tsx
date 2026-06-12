'use client'
import { useState, useCallback } from 'react'
import GameCard from '@/components/GameCard'
import type { GameWithPrediction, Prediction } from '@/lib/types'

type Props = { games: GameWithPrediction[] }

export default function PalpitesClient({ games }: Props) {
  const [state, setState] = useState(games)

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

  // Agrupa por grupo
  const groups: Record<string, GameWithPrediction[]> = {}
  for (const g of state) {
    const key = g.group ?? '?'
    if (!groups[key]) groups[key] = []
    groups[key].push(g)
  }

  const total = state.length
  const done = state.filter((g) => g.prediction).length

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Meus Palpites</h1>
        <span className="text-sm text-gray-500">
          {done}/{total} registrados
        </span>
      </div>

      {/* barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 -mt-4">
        🔒 Palpites são bloqueados 1h antes do início de cada jogo.
      </p>

      {Object.entries(groups)
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
  )
}
