"use client";

import { useState } from "react";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { TierComparisonTable } from "@/components/subscription/TierComparisonTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface BillingClientProps {
  subscriptionData: {
    subscription: {
      id: string;
      plan: string;
      status: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
    };
    usageStats: {
      creditsUsed: number;
      activeListings: number;
      totalListings: number;
      totalVideosGenerated: number;
      storageUsed: number;
    };
  };
  userId: string;
}

const createPortalSession = async (
  userId: string
): Promise<{ url: string }> => {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create portal session");
  }

  return response.json();
};

export const BillingClient = ({
  subscriptionData: data,
  userId,
}: BillingClientProps) => {
  // Mutation for managing subscription
  const { mutate: manageSubscription, isPending: isManaging } = useMutation({
    mutationFn: () => createPortalSession(userId),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("Failed to open billing portal");
    },
  });
  console.log("data", data);
  return (
    <div className='max-w-[800px] mx-auto px-4 py-16'>
      <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
        Billing
      </h1>

      {/* Current Plan Section */}
      <div className='mb-16'>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Current Plan
        </h2>
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <SubscriptionStatus
              status={data.subscription.status}
              tier={data.subscription.plan}
              creditsUsed={data.usageStats.creditsUsed}
              activeListings={data.usageStats.activeListings}
              totalListings={data.usageStats.totalListings}
              onManageSubscription={() => manageSubscription()}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className='flex gap-4'>
          <Button
            onClick={() => manageSubscription()}
            className='flex items-center gap-2'
            variant='outline'
            disabled={isManaging}
          >
            <CreditCard className='h-4 w-4' />
            {isManaging ? "Loading..." : "Update Payment Method"}
          </Button>
          {/* Temporarily disabled
          <Button
            onClick={() =>
              window.open("/api/subscription/download-invoices", "_blank")
            }
            className='flex items-center gap-2'
            variant='outline'
          >
            <Receipt className='h-4 w-4' />
            Download Invoices
          </Button>
          */}
        </div>
      </div>

      {/* Usage Section */}
      {/* <div className='mb-16'>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Usage & Limits
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <TierComparisonTable
              features={[
                {
                  name: "Credits",
                  description: "Monthly credits allocation",
                },
                {
                  name: "Active Listings",
                  description: "Maximum concurrent listings",
                },
                {
                  name: "Photos per Listing",
                  description: "Maximum photos per listing",
                },
                {
                  name: "Premium Templates",
                  description: "Access to premium video templates",
                },
              ]}
              tiers={[
                {
                  name: data.subscription?.plan || "Current Plan",
                  features: {
                    Credits: {
                      included: true,
                      value: `${data.usageStats?.creditsUsed || 0}/${
                        data.subscription?.creditsPerInterval || 0
                      }`,
                    },
                    "Active Listings": {
                      included: true,
                      value: `${data.usageStats?.activeListings || 0}/${
                        data.subscription?.tier?.maxActiveListings || 0
                      }`,
                    },
                    "Photos per Listing": {
                      included: true,
                      value: data.subscription?.tier?.maxPhotosPerListing,
                    },
                    "Premium Templates": {
                      included:
                        data.subscription?.tier?.premiumTemplatesEnabled,
                    },
                  },
                },
              ]}
              currentTierId={data.subscription?.tier?.id}
            />
          </CardContent>
        </Card>
      </div> */}

      {/* Invoices Section - Temporarily Disabled 
      <div>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Invoices
        </h2>
        <Card>
          <CardContent className='pt-6'>
            {data.invoices && data.invoices.length > 0 ? (
              <div className='space-y-4'>
                {data.invoices.map((invoice) => (
                  <div key={invoice.id} className='p-4 border rounded'>
                    {invoice.id}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                No invoices found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  );
};
