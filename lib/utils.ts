// Palpites bloqueados 1h antes do início do jogo
export const LOCK_BUFFER_MS = 60 * 60 * 1000

export function isGameLocked(matchDate: string): boolean {
  return Date.now() >= new Date(matchDate).getTime() - LOCK_BUFFER_MS
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcPoints(
  pred: { score_a: number; score_b: number },
  result: { score_a: number; score_b: number }
): number {
  if (pred.score_a === result.score_a && pred.score_b === result.score_b) return 5
  const predSign = Math.sign(pred.score_a - pred.score_b)
  const resSign = Math.sign(result.score_a - result.score_b)
  if (predSign === resSign) return 3
  return 0
}
