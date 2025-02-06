"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useToast } from "@/components/common/Toast";
import { trpc } from "@/lib/trpc";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete: () => void;
  currentTier?: string;
}

export default function PricingModal({
  isOpen,
  onClose,
  onUpgradeComplete,
  currentTier,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const handleUpgrade = async (priceId: string) => {
    try {
      setIsLoading(true);
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const { sessionId } = await checkoutMutation.mutateAsync({
        priceId,
        successUrl: `${window.location.origin}/dashboard?upgrade=success`,
        cancelUrl: `${window.location.origin}/dashboard?upgrade=cancelled`,
      });

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to start checkout",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel 
            className="mx-auto w-full max-w-3xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
          >
                <Dialog.Title
                  as='h3'
                  className='text-2xl font-bold text-gray-900 mb-8 text-center'
                >
                  Upgrade Your Plan
                </Dialog.Title>

                <div className='grid md:grid-cols-2 gap-8'>
                  {/* Free Plan */}
                  <div className='border rounded-lg p-6'>
                    <h4 className='text-xl font-semibold mb-4'>Free</h4>
                    <p className='text-3xl font-bold mb-6'>$0/mo</p>
                    <ul className='space-y-3 mb-6'>
                      <li className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Basic video template
                      </li>
                      <li className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Up to 5 listings/month
                      </li>
                    </ul>
                    <button
                      className='w-full py-2 bg-gray-100 text-gray-700 rounded-lg'
                      disabled
                    >
                      Current Plan
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className='border rounded-lg p-6 bg-blue-50 border-blue-200'>
                    <h4 className='text-xl font-semibold mb-4'>Pro</h4>
                    <p className='text-3xl font-bold mb-6'>$29/mo</p>
                    <ul className='space-y-3 mb-6'>
                      <li className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        All video templates
                      </li>
                      <li className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Unlimited listings
                      </li>
                      <li className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-green-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        Priority processing
                      </li>
                    </ul>
                    <button
                      onClick={() => handleUpgrade("price_pro_monthly")}
                      disabled={isLoading || currentTier === "pro"}
                      className={`w-full py-2 bg-blue-600 text-white rounded-lg ${
                        isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Upgrade Now"}
                    </button>
                  </div>
                </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
