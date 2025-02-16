<<<<<<< HEAD
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateCheckoutSession } from "@/hooks/queries/use-subscription";
import { useUserData } from "@/hooks/queries/use-user";
import { toast } from "sonner";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  onUpgradeComplete?: () => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  listingId,
  onUpgradeComplete,
}: PricingModalProps) {
  const { data: userData } = useUserData();
  const createCheckoutSession = useCreateCheckoutSession();

  const handleUpgrade = async (priceId: string) => {
    if (!userData?.id) {
      toast.error("Please sign in to upgrade your plan");
      return;
    }

    try {
      const url = await createCheckoutSession.mutateAsync({
        priceId,
        userId: userData.id,
        successUrl: `${window.location.origin}/dashboard/${listingId}?upgrade_success=true`,
        cancelUrl: `${window.location.origin}/dashboard/${listingId}`,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("[UPGRADE_ERROR]", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start upgrade process"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[800px]'>
        <div className='p-6'>
          <h2 className='text-2xl font-bold mb-8 text-center'>
            Upgrade to Access Premium Features
          </h2>

          <div className='grid gap-8 md:grid-cols-2'>
            {/* Pro Plan */}
            <div className='border rounded-lg p-6'>
              <h3 className='text-xl font-semibold mb-4'>Pro Plan</h3>
              <p className='text-gray-600 mb-6'>
                Perfect for real estate professionals
              </p>
              <ul className='space-y-3 mb-8'>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Premium video templates
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Unlimited downloads
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Priority support
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade("price_pro")}
                disabled={createCheckoutSession.isPending}
                className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {createCheckoutSession.isPending
                  ? "Processing..."
                  : "Upgrade to Pro"}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className='border rounded-lg p-6'>
              <h3 className='text-xl font-semibold mb-4'>Enterprise Plan</h3>
              <p className='text-gray-600 mb-6'>For agencies and large teams</p>
              <ul className='space-y-3 mb-8'>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  All Pro features
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Custom branding
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  API access
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Dedicated support
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade("price_enterprise")}
                disabled={createCheckoutSession.isPending}
                className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {createCheckoutSession.isPending
                  ? "Processing..."
                  : "Upgrade to Enterprise"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
=======

>>>>>>> 8a13445 (first commit)
