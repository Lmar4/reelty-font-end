"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { TierComparisonTable } from "@/components/subscription/TierComparisonTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Receipt, History } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SubscriptionData {
  subscription: any;
  invoices: any[];
  usageStats: any;
}

// Data fetching functions
const fetchSubscriptionData = async (
  userId: string
): Promise<SubscriptionData> => {
  const [subResponse, invoicesResponse, statsResponse] = await Promise.all([
    fetch(`/api/subscription/status?userId=${userId}`),
    fetch(`/api/subscription/invoices?userId=${userId}`),
    fetch(`/api/subscription/usage?userId=${userId}`),
  ]);

  if (!subResponse.ok || !invoicesResponse.ok || !statsResponse.ok) {
    throw new Error("Failed to load subscription data");
  }

  const [subscription, { invoices }, usageStats] = await Promise.all([
    subResponse.json(),
    invoicesResponse.json(),
    statsResponse.json(),
  ]);

  return { subscription, invoices, usageStats };
};

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

export default function BillingSettings() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Query for subscription data
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: () => fetchSubscriptionData(userId!),
    enabled: !!userId,
  });

  // Mutation for managing subscription
  const { mutate: manageSubscription, isPending: isManaging } = useMutation({
    mutationFn: () => createPortalSession(userId!),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("Failed to open billing portal");
    },
  });

  if (isLoading) {
    return (
      <div className='max-w-[800px] mx-auto px-4 py-16'>
        <div className='animate-pulse'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-[800px] mx-auto px-4 py-16'>
        <div className='text-red-500'>Error loading subscription data</div>
      </div>
    );
  }

  const { subscription, invoices, usageStats } = data!;

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
              status={subscription?.status}
              tier={subscription?.tier}
              creditsUsed={usageStats?.creditsUsed || 0}
              activeListings={usageStats?.activeListings || 0}
              periodEnd={
                subscription?.periodEnd
                  ? new Date(subscription.periodEnd)
                  : undefined
              }
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
        </div>
      </div>

      {/* Usage Section */}
      <div className='mb-16'>
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
                  name: subscription?.tier?.name || "Current Plan",
                  price: subscription?.tier?.monthlyPrice || 0,
                  features: {
                    Credits: {
                      included: true,
                      value: `${usageStats?.creditsUsed || 0}/${
                        subscription?.tier?.creditsPerInterval || 0
                      }`,
                    },
                    "Active Listings": {
                      included: true,
                      value: `${usageStats?.activeListings || 0}/${
                        subscription?.tier?.maxActiveListings || 0
                      }`,
                    },
                    "Photos per Listing": {
                      included: true,
                      value: subscription?.tier?.maxPhotosPerListing,
                    },
                    "Premium Templates": {
                      included: subscription?.tier?.premiumTemplatesEnabled,
                    },
                  },
                },
              ]}
              currentTierId={subscription?.tier?.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Invoices Section */}
      <div>
        <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-6'>
          Invoices
        </h2>
        <Card>
          <CardContent className='pt-6'>
            {invoices.length > 0 ? (
              <div className='space-y-4'>
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className='flex items-center justify-between py-4 border-b last:border-0'
                  >
                    <div className='flex items-center gap-4'>
                      <History className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <div className='font-medium'>
                          {new Date(
                            invoice.created * 1000
                          ).toLocaleDateString()}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {invoice.status === "paid"
                            ? "Payment successful"
                            : "Payment failed"}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <div className='font-medium'>
                          ${(invoice.amount_paid / 100).toFixed(2)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {invoice.status}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          window.open(invoice.invoice_pdf, "_blank")
                        }
                      >
                        <Receipt className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-[15px] text-[#6B7280]'>No invoices.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
