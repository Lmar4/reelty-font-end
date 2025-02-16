import PricingCards from "./PricingCards";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  onUpgradeComplete: () => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  listingId,
  onUpgradeComplete,
}: PricingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[1200px] p-6 border border-gray-200 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto w-[calc(100%-2rem)] max-h-[80vh] sm:max-h-[85vh] overflow-y-auto bg-white rounded-lg'>
        <DialogTitle className='text-xl font-semibold text-center mb-6'>
          Choose a plan to continue and unlock Premium features!
        </DialogTitle>
        <PricingCards isModal={true} />
      </DialogContent>
    </Dialog>
  );
}
