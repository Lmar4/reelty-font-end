import PricingCards from "./PricingCards";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
<<<<<<< HEAD
import { Check } from "lucide-react";
=======
>>>>>>> 8a13445 (first commit)

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
<<<<<<< HEAD
      <DialogContent className='sm:max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto bg-white rounded-lg shadow-xl z-[100] p-0'>
        <div className='p-6 space-y-6'>
          <div className='text-center space-y-2'>
            <DialogTitle className='text-xl font-semibold'>
              Choose a plan to continue and unlock Premium features!
            </DialogTitle>
          </div>

          <div className='flex justify-center gap-4 mb-6'>
            <button className='px-4 py-2 bg-primary text-white rounded-full'>
              Monthly
            </button>
            <button className='px-4 py-2 text-gray-600 rounded-full flex items-center gap-2'>
              Yearly
              <span className='text-green-500 text-sm'>Save $190</span>
            </button>
          </div>

          <div className='bg-white rounded-lg p-6 space-y-6'>
            <div className='flex justify-center'>
              <img src='/logo.svg' alt='Reelty' className='h-8' />
            </div>

            <div className='text-center'>
              <div className='flex items-baseline justify-center'>
                <span className='text-4xl font-bold'>$29</span>
                <span className='text-gray-500 ml-1'>/month</span>
              </div>
            </div>

            <button className='w-full py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors'>
              Get Started
            </button>

            <p className='text-center text-sm text-gray-500'>
              Secured by Stripe
            </p>

            <ul className='space-y-3'>
              <li className='flex items-center gap-2'>
                <Check className='h-5 w-5 text-primary' />
                <span>Upload 10 videos monthly</span>
              </li>
              <li className='flex items-center gap-2'>
                <Check className='h-5 w-5 text-primary' />
                <span>Up to 45 minutes long videos</span>
              </li>
              <li className='flex items-center gap-2'>
                <Check className='h-5 w-5 text-primary' />
                <span>Generate 100 clips monthly</span>
              </li>
              <li className='flex items-center gap-2'>
                <Check className='h-5 w-5 text-primary' />
                <span>HD download</span>
              </li>
            </ul>
          </div>

          <div className='bg-black text-white p-4 rounded-lg flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <img src='/logo.svg' alt='Reelty' className='h-6 invert' />
              <span className='font-semibold'>Pro</span>
            </div>
          </div>
        </div>
=======
      <DialogContent className='sm:max-w-[1200px] p-6 border border-gray-200 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto w-[calc(100%-2rem)] max-h-[80vh] sm:max-h-[85vh] overflow-y-auto bg-white rounded-lg'>
        <DialogTitle className='text-xl font-semibold text-center mb-6'>
          Choose a plan to continue and unlock Premium features!
        </DialogTitle>
        <PricingCards isModal={true} />
>>>>>>> 8a13445 (first commit)
      </DialogContent>
    </Dialog>
  );
}
