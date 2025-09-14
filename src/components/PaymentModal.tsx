'use client';

import { useState, useEffect } from 'react';
import { PAYSTACK_CONFIG } from '@/config/paystack';
import { useAuth } from '@/hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vipPackage: string;
  amount: number;
  onPaymentSuccess: (reference: string, packageName: string) => void;
  location: 'ghana' | 'not-ghana';
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  vipPackage, 
  amount, 
  onPaymentSuccess,
  location,
  cardRef
}: PaymentModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();

  // Only enable Paystack for Ghana users
  if (!isOpen || location !== 'ghana') return null;

  const handlePaymentSuccess = async (reference: string) => {
    setIsLoading(true);
    
    try {
      // Verify payment with backend
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          packageName: vipPackage
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        onPaymentSuccess(reference, vipPackage);
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const payWithPaystack = () => {
    const targetEmail = email || (userData as any)?.email || window.prompt('Enter your email for payment receipt') || '';
    if (!targetEmail) {
      alert('Email is required to proceed with payment.');
      onClose();
      return;
    }
    setEmail(targetEmail);

    const handler = (window as any).PaystackPop?.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: targetEmail,
      amount: amount * 100, // Convert to kobo
      currency: PAYSTACK_CONFIG.currency,
      channels: PAYSTACK_CONFIG.channels,
      ref: '' + Math.floor(Math.random() * 1000000000 + 1),
      callback: function(response: any) {
        handlePaymentSuccess(response.reference);
      },
      onClose: function() {
        console.log('Payment window closed');
        onClose();
      },
    });
    
    if (handler) {
      handler.openIframe();
    } else {
      alert('Paystack is not loaded. Please refresh the page.');
    }
  };
  // Trigger Paystack Inline (shows Mobile Money with network selection)
  useEffect(() => {
    if (!isOpen) return

    const emailToUse = (userData as any)?.email || `user+${Date.now()}@betgeniuz.local`

    const handler = (window as any).PaystackPop?.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: emailToUse,
      amount: amount * 100,
      currency: PAYSTACK_CONFIG.currency,
      channels: PAYSTACK_CONFIG.channels, // includes 'mobile_money'
      ref: '' + Math.floor(Math.random() * 1000000000 + 1),
      metadata: {
        custom_fields: [
          { display_name: 'VIP Package', variable_name: 'vip_package', value: vipPackage }
        ]
      },
      callback: function(response: any) {
        handlePaymentSuccess(response.reference)
      },
      onClose: function() {
        onClose()
      }
    })

    if (handler) handler.openIframe()
    else {
      alert('Paystack failed to load. Please refresh and try again.')
      onClose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Render nothing so only official Paystack inline modal is shown
  return null
};