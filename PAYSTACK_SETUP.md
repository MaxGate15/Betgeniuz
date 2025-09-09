# Paystack Integration Setup

## Overview
This project now includes Paystack payment integration for VIP package purchases. Users can click "Buy Now" on VIP cards to purchase packages using various payment methods.

## Setup Instructions

### 1. Get Paystack API Keys
1. Sign up at [Paystack](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your Test/Live Public Key and Secret Key

### 2. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Update Configuration
Edit `src/config/paystack.ts` to match your Paystack settings:

```typescript
export const PAYSTACK_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_actual_key',
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_actual_key',
  currency: 'GHS', // Change to your preferred currency
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
};
```

### 4. Backend Integration
The current implementation includes a mock API route at `/api/verify-payment`. For production:

1. **Verify payments** with Paystack's API
2. **Store purchase records** in your database
3. **Send confirmation emails** to users
4. **Handle webhooks** for payment status updates

### 5. Features Implemented

#### Payment Flow
1. User clicks "Buy Now" on VIP card
2. Payment modal opens with email input
3. Paystack payment form loads
4. User completes payment
5. Payment is verified with backend
6. VIP package is activated for user

#### VIP Package States
- **Available**: Shows "Buy Now" button
- **Purchased**: Shows "✓ Purchased" status
- **Sold Out**: Shows "SOLD OUT" banner (admin controlled)
- **Results Updated**: Shows match results instead of buy button

#### Payment Methods Supported
- Credit/Debit Cards
- Bank Transfer
- USSD
- QR Code
- Mobile Money
- Bank Transfer

### 6. Testing
1. Use Paystack test cards for testing
2. Test different payment scenarios
3. Verify payment callbacks work correctly
4. Test error handling

### 7. Production Checklist
- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoints
- [ ] Implement proper error handling
- [ ] Add payment analytics
- [ ] Set up email notifications
- [ ] Test all payment methods
- [ ] Configure SSL certificates

## File Structure
```
src/
├── components/
│   ├── PaystackPayment.tsx    # Paystack payment component
│   └── PaymentModal.tsx       # Payment modal wrapper
├── config/
│   └── paystack.ts            # Paystack configuration
├── app/
│   ├── api/
│   │   └── verify-payment/    # Payment verification API
│   └── predictions/
│       └── page.tsx           # Updated with payment integration
```

## Support
For Paystack integration issues, refer to:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments)
