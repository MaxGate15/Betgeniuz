'use client';

import { useState, useEffect } from 'react';

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

  if (!isOpen) return null;

  // Only show Paystack payment for Ghana users
  if (location !== 'ghana') {
    return null;
  }

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
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    const handler = (window as any).PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: 'GHS',
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">{email || 'freakinmax93@gmail.com'}</div>
              <div className="text-lg font-semibold text-gray-800">Pay GHS {amount}</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex h-96">
          {/* Payment Methods Sidebar */}
          <div className="w-80 bg-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-8 uppercase">PAY WITH</h3>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-lg mr-4 flex items-center justify-center">
                  <span className="text-white text-lg">📱</span>
                </div>
                <span className="text-lg font-medium text-green-700">Mobile Money</span>
              </div>
              <div className="flex items-center p-4 hover:bg-gray-200 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-gray-400 rounded-lg mr-4 flex items-center justify-center">
                  <span className="text-white text-lg">💳</span>
                </div>
                <span className="text-lg text-gray-600">Card</span>
              </div>
              <div className="flex items-center p-4 hover:bg-gray-200 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-gray-400 rounded-lg mr-4 flex items-center justify-center">
                  <span className="text-white text-lg">🏦</span>
                </div>
                <span className="text-lg text-gray-600">Bank Transfer</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📱</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mobile Money</h2>
              <p className="text-lg text-gray-600">
                Enter your mobile money number and provider to start the payment
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Mobile Number
                </label>
                <div className="flex">
                  <input
                    type="tel"
                    placeholder="050 000 0000"
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl"
                  />
                  <div className="px-6 py-4 bg-gray-50 border-2 border-l-0 border-gray-300 rounded-r-lg flex items-center">
                    <span className="text-2xl">🇬🇭</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Provider
                </label>
                <select className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl">
                  <option>Choose Provider</option>
                  <option>MTN</option>
                  <option>Vodafone</option>
                  <option>AirtelTigo</option>
                </select>
              </div>

              {isLoading ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-5 px-8 rounded-lg font-bold text-xl"
                >
                  Processing...
                </button>
              ) : (
                <button
                  onClick={payWithPaystack}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-5 px-8 rounded-lg font-bold text-xl transition-colors"
                >
                  Confirm
                </button>
              )}
            </div>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center text-lg text-gray-500">
                <span className="mr-2">🔒</span>
                <span>Secured by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};