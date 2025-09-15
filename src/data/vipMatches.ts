export interface MatchResult {
  id: string
  homeTeam: string
  awayTeam: string
  option: string
  odds: string
  result: 'win' | 'loss' | 'pending'
}

export interface VIPPackage {
  id: string
  name: string
  price: string
  matches: MatchResult[]
  isResultsUpdated: boolean
  isSoldOut: boolean
  bookingCodes: {
    sporty: string
    msport: string
    football: string
  }
}

// Fetch and transform API data to VIPPackage structure
const fetchVIPMatches = async (): Promise<Record<string, VIPPackage>> => {
  const res = await fetch('https://api.betgeniuz.com/games/list-vip-slips')
  const data = await res.json()
  const result: Record<string, VIPPackage> = {}

  data.forEach((item: any) => {
    const cat = item.booking.category
    result[cat] = {
      id: cat,
      name: cat.toUpperCase(),
      price: `GHS ${item.booking.price}`,
      isResultsUpdated: !!item.booking.updated,
      isSoldOut: !!item.booking.sold_out,
      matches: item.games.map((g: any) => ({
        id: `${cat}-match${g.id}`,
        homeTeam: g.home_team,
        awayTeam: g.away_team,
        option: g.prediction,
        odds: g.odds.toString(),
        result:
          g.match_status === 'won'
            ? 'win'
            : g.match_status === 'lost'
            ? 'loss'
            : 'pending'
      })),
      bookingCodes: {
        sporty: item.booking.share_code || '',
        msport: item.booking.share_code || '',
        football: item.booking.share_code || ''
      }
    }
  })

  return result
}

export { fetchVIPMatches }

const fetchVIPResultsUpdated = async () => {
  const vipMatches = await fetchVIPMatches()
  return Object.fromEntries(
    Object.entries(vipMatches).map(([k, v]) => [k, v.isResultsUpdated])
  )
}

export { fetchVIPResultsUpdated }

const fetchVIPSoldOut = async () => {
  const vipMatches = await fetchVIPMatches()
  return Object.fromEntries(
    Object.entries(vipMatches).map(([k, v]) => [k, v.isSoldOut])
  )
}

export { fetchVIPSoldOut }

// VIP_DATE_HEADER is not available from API, so you may want to handle it elsewhere
// VIP_DATE_HEADER is not available from API, so you may want to handle it elsewhere
