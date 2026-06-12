const API_BASE = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 1   // FIFA World Cup
const SEASON = 2026
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

// English team names from api-sports.io → pt-BR names used in the DB
// Mirrors update-teams.sql
const TEAM_MAP: Record<string, string> = {
  'Mexico': 'México',
  'South Africa': 'África do Sul',
  'South Korea': 'Coreia do Sul',
  'Czech Republic': 'Tchéquia',
  'Czechia': 'Tchéquia',
  'Canada': 'Canadá',
  'Bosnia': 'Bósnia e Herzegovina',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Qatar': 'Catar',
  'Switzerland': 'Suíça',
  'Brazil': 'Brasil',
  'Morocco': 'Marrocos',
  'Scotland': 'Escócia',
  'USA': 'Estados Unidos',
  'United States': 'Estados Unidos',
  'Paraguay': 'Paraguai',
  'Australia': 'Austrália',
  'Turkey': 'Turquia',
  'Türkiye': 'Turquia',
  'Germany': 'Alemanha',
  'Curacao': 'Curaçao',
  "Ivory Coast": 'Costa do Marfim',
  "Cote d'Ivoire": 'Costa do Marfim',
  "Côte d'Ivoire": 'Costa do Marfim',
  'Ecuador': 'Equador',
  'Netherlands': 'Holanda',
  'Holland': 'Holanda',
  'Japan': 'Japão',
  'Sweden': 'Suécia',
  'Tunisia': 'Tunísia',
  'Belgium': 'Bélgica',
  'Egypt': 'Egito',
  'Iran': 'Irã',
  'New Zealand': 'Nova Zelândia',
  'Spain': 'Espanha',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arábia Saudita',
  'Uruguay': 'Uruguai',
  'France': 'França',
  'Iraq': 'Iraque',
  'Norway': 'Noruega',
  'Algeria': 'Argélia',
  'Austria': 'Áustria',
  'Jordan': 'Jordânia',
  'DR Congo': 'RD Congo',
  'Congo DR': 'RD Congo',
  'Democratic Republic of Congo': 'RD Congo',
  'Uzbekistan': 'Uzbequistão',
  'Colombia': 'Colômbia',
  'England': 'Inglaterra',
  'Croatia': 'Croácia',
  'Ghana': 'Gana',
  'Panama': 'Panamá',
  'Senegal': 'Senegal',
  'Argentina': 'Argentina',
  'Haiti': 'Haiti',
  'Portugal': 'Portugal',
}

type RawFixture = {
  fixture: { id: number; date: string; status: { short: string } }
  teams: { home: { name: string }; away: { name: string } }
  goals: { home: number | null; away: number | null }
}

export type ApiFixture = {
  date: string
  statusShort: string
  homeTeamPt: string
  awayTeamPt: string
  homeGoals: number
  awayGoals: number
}

export type MatchedResult = {
  gameId: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
}

function normalizeName(name: string): string {
  return TEAM_MAP[name] ?? name
}

function utcDateStr(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export async function fetchFinishedFixtures(
  pendingGames: { match_date: string }[]
): Promise<ApiFixture[]> {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) throw new Error('API_FOOTBALL_KEY não configurada')

  // Limit request to the date range of pending games → today to save quota
  const dates = pendingGames.map((g) => g.match_date)
  const fromDate = utcDateStr(dates.reduce((a, b) => (a < b ? a : b)))
  const toDate = utcDateStr(new Date().toISOString())

  const url = new URL(`${API_BASE}/fixtures`)
  url.searchParams.set('league', String(LEAGUE_ID))
  url.searchParams.set('season', String(SEASON))
  url.searchParams.set('from', fromDate)
  url.searchParams.set('to', toDate)

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': key },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API-Football ${res.status} ${res.statusText}: ${body}`)
  }

  const json = await res.json()

  // api-sports.io returns errors as an object when auth fails or quota exceeded
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(json.errors)}`)
  }

  const raw: RawFixture[] = json.response ?? []

  return raw
    .filter((f) => FINISHED_STATUSES.has(f.fixture.status.short))
    .filter((f) => f.goals.home !== null && f.goals.away !== null)
    .map((f) => ({
      date: f.fixture.date,
      statusShort: f.fixture.status.short,
      homeTeamPt: normalizeName(f.teams.home.name),
      awayTeamPt: normalizeName(f.teams.away.name),
      homeGoals: f.goals.home as number,
      awayGoals: f.goals.away as number,
    }))
}

export function matchFixturesToGames(
  fixtures: ApiFixture[],
  games: { id: string; team_a: string; team_b: string; match_date: string }[]
): MatchedResult[] {
  const results: MatchedResult[] = []

  for (const fixture of fixtures) {
    const fixtureDay = utcDateStr(fixture.date)

    const game = games.find((g) => {
      if (utcDateStr(g.match_date) !== fixtureDay) return false
      return (
        (g.team_a === fixture.homeTeamPt && g.team_b === fixture.awayTeamPt) ||
        (g.team_a === fixture.awayTeamPt && g.team_b === fixture.homeTeamPt)
      )
    })

    if (!game) continue

    // Swap scores if API home/away is reversed vs DB team_a/team_b order
    const swapped = game.team_a === fixture.awayTeamPt
    results.push({
      gameId: game.id,
      teamA: game.team_a,
      teamB: game.team_b,
      scoreA: swapped ? fixture.awayGoals : fixture.homeGoals,
      scoreB: swapped ? fixture.homeGoals : fixture.awayGoals,
    })
  }

  return results
}
