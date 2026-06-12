export type GameStatus = 'upcoming' | 'in_progress' | 'finished'

export type Game = {
  id: string
  group: string | null
  stage: string
  team_a: string
  team_b: string
  match_date: string
  venue?: string
  status: GameStatus
}

export type Prediction = {
  id?: string
  user_id?: string
  game_id: string
  score_a: number
  score_b: number
  created_at?: string
  updated_at?: string
}

export type Result = {
  id: string
  game_id: string
  score_a: number
  score_b: number
  inserted_at: string
}

export type Profile = {
  id: string
  nome: string
  created_at: string
}

export type Score = {
  user_id: string
  nome: string
  exact_scores: number
  correct_winner: number
  total_points: number
}

export type GameWithPrediction = Game & {
  prediction: Prediction | null
  result: Result | null
  isLocked: boolean
}

export type GameWithResult = Game & {
  result: Result | null
}

export type PredictionWithProfile = Prediction & {
  profiles: { nome: string }
}
