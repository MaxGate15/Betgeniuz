// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here',
  currency: 'GHS', // Ghanaian Cedis
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
};

// VIP Package Pricing
export const VIP_PACKAGES = {
  vip1: { name: 'VIP 1', amount: 100, description: 'Basic VIP Package' },
  vip2: { name: 'VIP 2', amount: 200, description: 'Premium VIP Package' },
  vip3: { name: 'VIP 3', amount: 300, description: 'Ultimate VIP Package' }
};
