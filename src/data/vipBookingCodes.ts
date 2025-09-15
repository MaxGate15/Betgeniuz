export interface BookingCodes {
  sporty: string
  msport: string
  football: string
}

export const VIP_BOOKING_CODES: Record<string, BookingCodes> = {
  vip1: {
    sporty: 'SP12345',
    msport: 'MS12345',
    football: 'FB12345'
  },
  vip2: {
    sporty: 'SP22345',
    msport: 'MS22345',
    football: 'FB22345'
  },
  vip3: {
    sporty: 'SP32345',
    msport: 'MS32345',
    football: 'FB32345'
  }
}

export const getBookingCodes = (vipType: string): BookingCodes => {
  return VIP_BOOKING_CODES[vipType] || VIP_BOOKING_CODES.vip1
}

export const updateBookingCodes = (vipType: string, codes: Partial<BookingCodes>) => {
  if (VIP_BOOKING_CODES[vipType]) {
    VIP_BOOKING_CODES[vipType] = { ...VIP_BOOKING_CODES[vipType], ...codes }
  }
}
