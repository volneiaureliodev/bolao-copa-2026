'use client'
import { useState, useEffect, useTransition } from 'react'
import type { GameWithPrediction } from '@/lib/types'
import { formatDate, calcPoints, LOCK_BUFFER_MS } from '@/lib/utils'

type Props = {
  game: GameWithPrediction
  onSave: (gameId: string, scoreA: number, scoreB: number) => Promise<void>
}

export default function GameCard({ game, onSave }: Props) {
  const [scoreA, setScoreA] = useState(game.prediction?.score_a?.toString() ?? '')
  const [scoreB, setScoreB] = useState(game.prediction?.score_b?.toString() ?? '')
  const [savedOk, setSavedOk] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [locked, setLocked] = useState(game.isLocked)

  useEffect(() => {
    const lockTime = new Date(game.match_date).getTime() - LOCK_BUFFER_MS
    const check = () => setLocked(Date.now() >= lockTime)
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [game.match_date])

  const hasResult = game.result != null
  const hasPred = game.prediction != null

  async function handleSave() {
    const a = parseInt(scoreA)
    const b = parseInt(scoreB)
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
      setErrMsg('Placar inválido')
      return
    }
    setErrMsg(null)
    startTransition(async () => {
      try {
        await onSave(game.id, a, b)
        setSavedOk(true)
        setTimeout(() => setSavedOk(false), 2500)
      } catch (e: unknown) {
        setErrMsg(e instanceof Error ? e.message : 'Erro ao salvar')
      }
    })
  }

  const statusBg: Record<string, string> = {
    upcoming: 'bg-white border-gray-200',
    in_progress: 'bg-yellow-50 border-yellow-300',
    finished: 'bg-gray-50 border-gray-200',
  }

  let pts: number | null = null
  if (hasResult && hasPred) {
    pts = calcPoints(game.prediction!, game.result!)
  }

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${statusBg[game.status]}`}>
      {/* Header: date + lock */}
      <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
        <span>{formatDate(game.match_date)}</span>
        <span className="flex items-center gap-1">
          {game.status === 'in_progress' && (
            <span className="text-yellow-600 font-bold animate-pulse">● AO VIVO</span>
          )}
          {game.status === 'upcoming' && (locked ? '🔒 Fechado' : '🔓 Aberto')}
          {game.status === 'finished' && <span className="text-gray-400">Encerrado</span>}
        </span>
      </div>

      {/* Teams + inputs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right font-semibold text-sm truncate">
          {game.team_a}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasResult ? (
            <span className="text-xl font-bold tabular-nums px-1">
              {game.result!.score_a} – {game.result!.score_b}
            </span>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={99}
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                disabled={locked}
                className="w-11 h-11 text-center border rounded-lg font-bold text-lg disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <span className="text-gray-400 font-bold">×</span>
              <input
                type="number"
                min={0}
                max={99}
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                disabled={locked}
                className="w-11 h-11 text-center border rounded-lg font-bold text-lg disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </>
          )}
        </div>

        <div className="flex-1 text-left font-semibold text-sm truncate">
          {game.team_b}
        </div>
      </div>

      {/* Result feedback */}
      {hasResult && hasPred && (
        <div className="mt-2 text-center text-xs">
          <span className="text-gray-400">
            Seu palpite: {game.prediction!.score_a} – {game.prediction!.score_b}
          </span>
          {' · '}
          {pts === 5 && <span className="text-yellow-600 font-bold">⭐ Placar exato +5pts</span>}
          {pts === 3 && <span className="text-blue-600 font-semibold">✓ Resultado certo +3pts</span>}
          {pts === 0 && <span className="text-red-400">✗ Não pontuou</span>}
        </div>
      )}

      {hasResult && !hasPred && (
        <div className="mt-2 text-center text-xs text-gray-400">Sem palpite registrado</div>
      )}

      {/* Save button */}
      {!locked && !hasResult && (
        <div className="mt-3 flex justify-center items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isPending || scoreA === '' || scoreB === ''}
            className="text-xs bg-green-600 text-white px-5 py-1.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Salvando…' : savedOk ? '✓ Salvo!' : 'Salvar'}
          </button>
          {errMsg && <span className="text-xs text-red-500">{errMsg}</span>}
        </div>
      )}

      {locked && !hasResult && !hasPred && (
        <div className="mt-2 text-center text-xs text-gray-400 italic">
          Palpite não registrado
        </div>
      )}

      {locked && !hasResult && hasPred && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Palpite registrado: {game.prediction!.score_a} – {game.prediction!.score_b}
        </div>
      )}
    </div>
  )
}
