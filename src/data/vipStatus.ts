export interface VIPStatus {
  vip1: boolean
  vip2: boolean
  vip3: boolean
}

export const VIP_RESULTS_UPDATED: VIPStatus = {
  vip1: false,
  vip2: false,
  vip3: false
}

export const VIP_SOLD_OUT: VIPStatus = {
  vip1: false,
  vip2: false,
  vip3: false
}

export const VIP_DATE_HEADER = '08/01, 08:37 AM'

export const updateVIPStatus = (statusType: 'results' | 'soldOut', vipType: keyof VIPStatus, value: boolean) => {
  if (statusType === 'results') {
    VIP_RESULTS_UPDATED[vipType] = value
  } else {
    VIP_SOLD_OUT[vipType] = value
  }
}

export const getVIPStatus = (vipType: keyof VIPStatus) => {
  return {
    resultsUpdated: VIP_RESULTS_UPDATED[vipType],
    soldOut: VIP_SOLD_OUT[vipType]
  }
}
