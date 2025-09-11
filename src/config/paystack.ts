// Paystack Configuration
export const PAYSTACK_CONFIG = {
  // Required: set these in .env.local
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  currency: 'GHS', // Ghanaian Cedis
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
};

// VIP Package Pricing
export const VIP_PACKAGES = {
  vip1: { 
    name: 'VIP 1', 
    amount: 100, 
    description: 'Basic VIP Package',
    bookingCodes: { sporty: 'SP12345', msport: 'MS12345', football: 'FB12345' }
  },
  vip2: { 
    name: 'VIP 2', 
    amount: 200, 
    description: 'Premium VIP Package',
    bookingCodes: { sporty: 'SP22345', msport: 'MS22345', football: 'FB22345' }
  },
  vip3: { 
    name: 'VIP 3', 
    amount: 300, 
    description: 'Ultimate VIP Package',
    bookingCodes: { sporty: 'SP32345', msport: 'MS32345', football: 'FB32345' }
  }
};
