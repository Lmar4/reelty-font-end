"use client";

import { useState, useEffect } from "react";
import PricingModal from "@/components/reelty/PricingModal";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SubscriptionStatus } from "@/types/prisma-types";

interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function BillingSettings() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (!userId) {
          return;
        }

        const token = await getToken();
        const response = await fetch(
          `/api/subscription/status?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription status");
        }

        const { data } = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast.error("Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [getToken, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='max-w-[800px] mx-auto px-4 py-16'>
      <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
        Billing
      </h1>

      {/* Current Plans Section */}
      <div className='mb-16'>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Current plan
        </h2>

        {loading ? (
          <div className='flex items-center gap-2 text-[15px] text-[#6B7280]'>
            <Loader2 className='w-4 h-4 animate-spin' />
            Loading subscription details...
          </div>
        ) : subscription && subscription.status === "active" ? (
          <div className='space-y-4'>
            <div className='bg-white border rounded-xl p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-[18px] font-semibold text-[#1c1c1c] mb-1 capitalize'>
                    {subscription.plan}
                  </h3>
                  {subscription.plan !== "FREE" && (
                    <p className='text-[15px] text-[#6B7280]'>
                      Active until {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className='text-[15px] text-red-500 mt-2'>
                      Your subscription will be canceled at the end of the
                      current period
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className='bg-[#1c1c1c] text-white px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#2c2c2c]'
                >
                  Change plan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <p className='text-[15px] text-[#6B7280]'>
              You don't have an active subscription.
            </p>
            <button
              onClick={() => setIsPricingOpen(true)}
              className='bg-[#1c1c1c] text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:bg-[#2c2c2c]'
            >
              Choose a plan
            </button>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Invoices
        </h2>
        <div className='text-[15px] text-[#6B7280]'>No invoices.</div>
      </div>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        listingId=''
        onUpgradeComplete={() => {
          setIsPricingOpen(false);
          window.location.reload(); // Refresh to show updated subscription
        }}
        currentTier={subscription?.plan}
        currentStatus={subscription?.status as SubscriptionStatus}
      />
    </div>
  );
}
