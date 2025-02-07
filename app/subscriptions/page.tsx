"use client";

import { trpc } from "@/lib/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/reelty/DashboardLayout";
import { useUserData } from "../../hooks/useUserData";

interface SubscriptionTier {
  id: string;
  description: string;
  pricing: string;
  isAdmin: boolean;
  features: string[];
}

export default function Subscriptions() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: userData } = useUserData();

  const { data: rawSubscriptionTiers } = trpc.subscription.getTiers.useQuery();
  const subscriptionTiers = rawSubscriptionTiers as SubscriptionTier[] | undefined;
  
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
            {subscriptionTiers?.filter(tier => !tier.isAdmin).map((tier) => (
              <div
                key={tier.id}
                className='border rounded-lg p-6 hover:shadow-lg transition-shadow'
              >
                <h3 className='text-xl font-semibold mb-2'>{tier.id}</h3>
                <p className='text-gray-600 mb-4'>{tier.description}</p>
                <p className='text-2xl font-bold mb-6'>
                  ${Number(tier.pricing).toFixed(2)}/mo
                </p>
                {Array.isArray(tier.features) && tier.features.length > 0 && (
                  <ul className='mb-6 space-y-2'>
                    {tier.features.map((feature, index) => (
                      <li key={index} className='flex items-center text-gray-700'>
                        <span className='mr-2'>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => handleSubscriptionUpdate(tier.id)}
                  disabled={isUpdating || userData?.subscriptionTier === tier.id}
                  className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {userData?.subscriptionTier === tier.id
                    ? "Current Plan"
                    : "Upgrade"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
