"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PricingModal from "@/components/reelty/PricingModal";
import CreditPackages from "@/components/reelty/CreditPackages";
import CreditHistory from "@/components/reelty/CreditHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "free";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface CreditBalance {
  total: number;
  available: number;
  used: number;
}

function SubscriptionSection() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/current");
      if (!response.ok) throw new Error("Failed to fetch subscription");
      const data = await response.json();
      return data.subscription;
    },
  });

  if (isLoading) {
    return <Skeleton className='h-48 w-full' />;
  }

  const isActiveSubscription = subscription?.status === "active";
  const isFreeSubscription = subscription?.status === "free";
  const showCancelButton =
    isActiveSubscription && !subscription?.cancelAtPeriodEnd;
  const renewalDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : "";

  return (
    <div className='space-y-8'>
      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Current Plan</h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium capitalize'>
                {subscription?.plan || "Free"}
              </h3>
              {!isFreeSubscription && renewalDate && (
                <p className='text-sm text-muted-foreground'>
                  {subscription?.cancelAtPeriodEnd
                    ? `Cancels on ${renewalDate}`
                    : `Renews on ${renewalDate}`}
                </p>
              )}
            </div>
            <Badge variant={isActiveSubscription ? "default" : "secondary"}>
              {subscription?.status || "free"}
            </Badge>
          </div>
          <div className='flex gap-4'>
            <Button onClick={() => setIsPricingOpen(true)}>
              {isActiveSubscription ? "Change Plan" : "Choose Plan"}
            </Button>
            {showCancelButton && (
              <Button variant='outline' onClick={() => {}}>
                Cancel Plan
              </Button>
            )}
          </div>
        </div>
      </Card>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        listingId=''
        onUpgradeComplete={() => setIsPricingOpen(false)}
      />
    </div>
  );
}

function CreditSection() {
  const { data: creditBalance, isLoading } = useQuery<CreditBalance>({
    queryKey: ["credit-balance"],
    queryFn: async () => {
      const response = await fetch("/api/credits/balance");
      if (!response.ok) throw new Error("Failed to fetch credit balance");
      const data = await response.json();
      return data;
    },
  });

  return (
    <div className='space-y-8'>
      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Credit Balance</h2>
        {isLoading ? (
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Total Credits</p>
              <p className='text-2xl font-bold'>{creditBalance?.total || 0}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Available</p>
              <p className='text-2xl font-bold'>
                {creditBalance?.available || 0}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Used</p>
              <p className='text-2xl font-bold'>{creditBalance?.used || 0}</p>
            </div>
          </div>
        )}
      </Card>

      <div>
        <h2 className='text-lg font-semibold mb-4'>Purchase Credits</h2>
        <CreditPackages />
      </div>

      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Credit History</h2>
        <CreditHistory />
      </Card>
    </div>
  );
}

export default function BillingSettings() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Billing & Credits</h1>
        <p className='text-muted-foreground'>
          Manage your subscription, credits, and view payment history.
        </p>
      </div>

      <Tabs defaultValue='subscription' className='space-y-8'>
        <TabsList>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          <TabsTrigger value='credits'>Credits</TabsTrigger>
        </TabsList>

        <TabsContent value='subscription'>
          <SubscriptionSection />
        </TabsContent>

        <TabsContent value='credits'>
          <CreditSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
