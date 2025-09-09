'use client';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: 'ghana' | 'not-ghana') => void;
  vipPackage: string;
  amount: number;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const LocationModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  vipPackage, 
  amount,
  cardRef
}: LocationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border-2 border-red-500 shadow-lg z-50">
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-red-600 uppercase">SELECT LOCATION</h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onLocationSelect('ghana')}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 px-3 rounded font-bold text-xs transition-colors border border-black"
          >
            IN GHANA
          </button>

          <button
            onClick={() => onLocationSelect('not-ghana')}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 px-3 rounded font-bold text-xs transition-colors border border-black"
          >
            NOT IN GHANA
          </button>
        </div>
      </div>
    </div>
  );
};
