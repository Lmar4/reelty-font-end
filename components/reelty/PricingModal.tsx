import PricingCards from './PricingCards';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-[1200px] w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-[32px] font-semibold text-[#1c1c1c] mb-2">
            Change your plan
          </h2>
          <p className="text-[18px] text-[#6B7280]">
            Compare our plans and find the one that best fits your needs.
          </p>
        </div>
        <PricingCards isModal />
      </div>
    </div>
  );
} 