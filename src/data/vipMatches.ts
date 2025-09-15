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

export const VIP_MATCHES_DATA: Record<string, VIPPackage> = {
  vip1: {
    id: 'vip1',
    name: 'VIP 1',
    price: 'GHS 100',
    isResultsUpdated: false,
    isSoldOut: false,
    matches: [
      {
        id: 'vip1-match1',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        option: 'Home',
        odds: '1.23',
        result: 'win'
      },
      {
        id: 'vip1-match2',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        option: 'Over 2.5',
        odds: '1.62',
        result: 'loss'
      },
      {
        id: 'vip1-match3',
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        option: 'Away',
        odds: '1.37',
        result: 'win'
      }
    ],
    bookingCodes: {
      sporty: 'SP12345',
      msport: 'MS12345',
      football: 'FB12345'
    }
  },
  vip2: {
    id: 'vip2',
    name: 'VIP 2',
    price: 'GHS 200',
    isResultsUpdated: true,
    isSoldOut: false,
    matches: [
      {
        id: 'vip2-match1',
        homeTeam: 'PSG',
        awayTeam: 'Bayern Munich',
        option: 'Over 1.5',
        odds: '1.21',
        result: 'win'
      },
      {
        id: 'vip2-match2',
        homeTeam: 'Inter Milan',
        awayTeam: 'AC Milan',
        option: 'Home',
        odds: '1.45',
        result: 'loss'
      },
      {
        id: 'vip2-match3',
        homeTeam: 'Atletico Madrid',
        awayTeam: 'Sevilla',
        option: 'Under 2.5',
        odds: '1.78',
        result: 'win'
      },
      {
        id: 'vip2-match4',
        homeTeam: 'Juventus',
        awayTeam: 'Napoli',
        option: 'Draw',
        odds: '3.20',
        result: 'loss'
      }
    ],
    bookingCodes: {
      sporty: 'SP22345',
      msport: 'MS22345',
      football: 'FB22345'
    }
  },
  vip3: {
    id: 'vip3',
    name: 'VIP 3',
    price: 'GHS 300',
    isResultsUpdated: true,
    isSoldOut: false,
    matches: [
      {
        id: 'vip3-match1',
        homeTeam: 'Manchester City',
        awayTeam: 'Real Madrid',
        option: 'Over 2.5',
        odds: '1.85',
        result: 'win'
      },
      {
        id: 'vip3-match2',
        homeTeam: 'Liverpool',
        awayTeam: 'Barcelona',
        option: 'Home',
        odds: '1.92',
        result: 'win'
      },
      {
        id: 'vip3-match3',
        homeTeam: 'PSG',
        awayTeam: 'Manchester United',
        option: 'Away',
        odds: '2.15',
        result: 'loss'
      },
      {
        id: 'vip3-match4',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Chelsea',
        option: 'Over 3.5',
        odds: '1.65',
        result: 'win'
      },
      {
        id: 'vip3-match5',
        homeTeam: 'Inter Milan',
        awayTeam: 'Arsenal',
        option: 'Draw',
        odds: '3.40',
        result: 'loss'
      }
    ],
    bookingCodes: {
      sporty: 'SP32345',
      msport: 'MS32345',
      football: 'FB32345'
    }
  }
}

export const VIP_RESULTS_UPDATED = {
  vip1: false,
  vip2: true,
  vip3: true
}

export const VIP_SOLD_OUT = {
  vip1: false,
  vip2: false,
  vip3: false
}

export const VIP_DATE_HEADER = '08/01, 08:37 AM'
