"use client";

import { useState } from "react";
import { useToast } from "@/components/common/Toast";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import type { RouterOutput } from "@/types/trpc";

type SubscriptionTier = RouterOutput["subscription"]["getTiers"][number];

export default function BillingPage() {
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: tiers, isLoading } = trpc.subscription.getTiers.useQuery();
  const checkoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      } else {
        showToast("Failed to create checkout session", "error");
      }
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const handleSubscribe = async (tierId: string) => {
    if (!user?.uid) {
      showToast("Please sign in to subscribe", "error");
      return;
    }

    try {
      setSelectedTier(tierId);
      await checkoutMutation.mutateAsync({
        priceId: tierId,
        userId: user.uid,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/billing`,
      });
    } catch (error) {
      // Error is handled by the mutation callbacks
    } finally {
      setSelectedTier(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>
        Subscription Plans
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {tiers?.map((tier) => (
          <div
            key={tier.id}
            className='bg-white rounded-lg shadow-lg overflow-hidden'
          >
            <div className='px-6 py-8'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                {tier.description}
              </h2>
              <p className='mt-4 text-4xl font-bold text-gray-900'>
                ${Number(tier.pricing).toFixed(2)}
                <span className='text-base font-medium text-gray-500'>
                  /month
                </span>
              </p>
              <ul className='mt-6 space-y-4'>
                {(tier.features as string[]).map((feature, index) => (
                  <li key={index} className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-6 w-6 text-green-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                    <p className='ml-3 text-base text-gray-700'>{feature}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={selectedTier === tier.id}
                className='mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {selectedTier === tier.id ? (
                  <Loader2 className='w-5 h-5 animate-spin mx-auto' />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
