"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useSubscriptionTiers,
  useCreateCheckoutSession,
} from "@/hooks/queries/use-subscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { SubscriptionTier } from "@/types/prisma-types";

export default function BillingPage() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const { data: tiers, isLoading } = useSubscriptionTiers();
  const checkoutMutation = useCreateCheckoutSession();

  const handleSubscribe = async (priceId: string) => {
    if (!userId) return;

    try {
      const checkoutUrl = await checkoutMutation.mutateAsync({
        priceId,
        userId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      window.location.href = checkoutUrl;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>Subscription Plans</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {tiers?.data?.map((tier: SubscriptionTier) => (
          <Card key={tier.id} className='p-6'>
            <h2 className='text-2xl font-bold mb-4'>{tier.name}</h2>
            <p className='text-gray-600 mb-4'>{tier.description}</p>
            <p className='text-3xl font-bold mb-6'>
              ${tier.monthlyPrice.toFixed(2)}/mo
            </p>
            <ul className='space-y-2 mb-6'>
              {tier.features.map((feature: string, index: number) => (
                <li key={index} className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe(tier.stripePriceId)}
              disabled={checkoutMutation.isPending}
              className='w-full'
            >
              {checkoutMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Subscribe
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
