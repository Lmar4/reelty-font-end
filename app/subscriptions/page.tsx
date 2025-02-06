"use client";

import { trpc } from "@/lib/trpc";
import type { RouterOutput } from "@/types/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/reelty/DashboardLayout";
import { useUserData } from "../../hooks/useUserData";

type SubscriptionTier = RouterOutput["subscription"]["getTiers"][number];

export default function Subscriptions() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: userData } = useUserData();

  const { data: subscriptionTiers } = trpc.subscription.getTiers.useQuery();
  const updateSubscriptionMutation = trpc.subscription.updateTier.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      setIsUpdating(false);
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      toast.error(error.message || "Failed to update subscription");
      setIsUpdating(false);
    },
  });

  const handleSubscriptionUpdate = async (tierId: string) => {
    try {
      setIsUpdating(true);
      await updateSubscriptionMutation.mutateAsync({
        userId: userData?.id || "",
        tierId,
      });
    } catch (error) {
      // Error handled by mutation callbacks
      console.error("Subscription update error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className='max-w-[800px] mx-auto px-4 py-16'>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
          Subscription Management
        </h1>

        <div className='space-y-8'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8'>
            <h2 className='font-medium text-blue-800 mb-2'>
              Current Subscription
            </h2>
            <p className='text-blue-600'>
              {userData?.subscriptionTier || "No active subscription"}
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {subscriptionTiers?.map((tier) => (
              <div
                key={tier.id}
                className='border rounded-lg p-6 hover:shadow-lg transition-shadow'
              >
                <h3 className='text-xl font-semibold mb-2'>{tier.id}</h3>
                <p className='text-gray-600 mb-4'>{tier.description}</p>
                <p className='text-2xl font-bold mb-6'>
                  ${Number(tier.pricing).toFixed(2)}/mo
                </p>
                <ul className='mb-6 space-y-2'>
                  {(tier.features as string[]).map((feature, index) => (
                    <li key={index} className='flex items-center'>
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
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscriptionUpdate(tier.id)}
                  disabled={
                    isUpdating || tier.id === userData?.subscriptionTier
                  }
                  className={`w-full px-4 py-2 rounded-lg ${
                    tier.id === userData?.subscriptionTier
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } transition-colors`}
                >
                  {tier.id === userData?.subscriptionTier
                    ? "Current Plan"
                    : "Switch Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
