import type { Score } from '@/lib/types'

type Props = {
  scores: Score[]
  highlightUserId?: string
}

export default function RankingTable({ scores, highlightUserId }: Props) {
  const sorted = [...scores].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.exact_scores !== a.exact_scores) return b.exact_scores - a.exact_scores
    return b.correct_winner - a.correct_winner
  })

  if (sorted.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        Nenhum palpite registrado ainda. Os placares aparecerão aqui conforme os jogos forem encerrados.
      </p>
    )
  }

  const medal = (i: number) =>
    i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1)

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-3 text-center w-12">#</th>
            <th className="px-4 py-3 text-left">Participante</th>
            <th className="px-4 py-3 text-center">Pontos</th>
            <th className="px-4 py-3 text-center">⭐ Exatos</th>
            <th className="px-4 py-3 text-center">✓ Resultados</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <tr
              key={s.user_id}
              className={`border-t transition-colors ${
                s.user_id === highlightUserId
                  ? 'bg-yellow-50 font-semibold'
                  : i % 2 === 0
                  ? 'bg-white'
                  : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-3 text-center text-base">{medal(i)}</td>
              <td className="px-4 py-3">
                {s.nome}
                {s.user_id === highlightUserId && (
                  <span className="ml-2 text-xs text-green-600">(você)</span>
                )}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-700 text-base">
                {s.total_points}
              </td>
              <td className="px-4 py-3 text-center">{s.exact_scores}</td>
              <td className="px-4 py-3 text-center">{s.correct_winner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
