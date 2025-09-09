'use client';

interface NonGhanaPaymentProps {
  vipPackage: string;
  amount: number;
  onClose: () => void;
}

export const NonGhanaPayment = ({ vipPackage, amount, onClose }: NonGhanaPaymentProps) => {
  const handleContactSupport = () => {
    // You can implement contact support logic here
    alert(`Please contact support for ${vipPackage} payment. Amount: ${amount}GH`);
  };

  const handleCryptoPayment = () => {
    // You can implement crypto payment logic here
    alert(`Crypto payment option for ${vipPackage} - ${amount}GH`);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
      <div className="bg-white rounded-lg border-2 border-red-500 p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 uppercase text-center flex-1">PAYMENT OPTIONS</h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2 text-center">Package: <span className="font-semibold">{vipPackage}</span></p>
          <p className="text-gray-600 mb-4 text-center">Amount: <span className="font-semibold text-lg">{amount}GH</span></p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 px-6 rounded-lg font-bold transition-colors border border-black"
          >
            CONTACT SUPPORT
          </button>

          <button
            onClick={handleCryptoPayment}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 px-6 rounded-lg font-bold transition-colors border border-black"
          >
            PAY WITH CRYPTO
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-bold transition-colors"
          >
            CANCEL
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          More payment options coming soon
        </p>
      </div>
    </div>
  );
};
