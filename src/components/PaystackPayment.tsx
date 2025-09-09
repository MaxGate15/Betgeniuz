'use client';

import { useState } from 'react';
import { PAYSTACK_CONFIG } from '@/config/paystack';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  vipPackage: string;
}

export const PaystackPayment = ({ 
  amount, 
  email, 
  onSuccess, 
  onClose, 
  vipPackage 
}: PaystackPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);

    // Create payment reference
    const reference = `VIP_${vipPackage}_${Date.now()}`;

    // Initialize Paystack payment
    const handler = (window as any).PaystackPop?.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: PAYSTACK_CONFIG.currency,
      ref: reference,
      metadata: {
        vip_package: vipPackage,
        custom_fields: [
          {
            display_name: "VIP Package",
            variable_name: "vip_package",
            value: vipPackage
          }
        ]
      },
      callback: function(response: any) {
        console.log('Payment successful:', response);
        onSuccess(response.reference);
        setIsLoading(false);
      },
      onClose: function() {
        console.log('Payment closed');
        onClose();
        setIsLoading(false);
      }
    });

    if (handler) {
      handler.openIframe();
    } else {
      alert('Paystack is not loaded. Please refresh the page and try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 border border-black"
    >
      {isLoading ? 'Processing...' : `PAY NOW - ${amount}GH`}
    </button>
  );
};
