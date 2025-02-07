"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-credits";
import { useCreditPackages } from "@/hooks/queries/use-credit-packages";
import { useCreateCheckoutSession } from "@/hooks/queries/use-subscription";
import type { CreditPackage } from "@/hooks/queries/use-credit-packages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreditPackages() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const { data: currentCredits, isLoading: isLoadingCredits } = useCredits(
    userId || ""
  );
  const { data: creditPackages, isLoading: isLoadingPackages } =
    useCreditPackages();
  const checkoutMutation = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (
    pkg: CreditPackage,
    isOneTime: boolean = false
  ) => {
    if (!userId) return;
    setIsProcessing(true);

    try {
      const checkoutUrl = await checkoutMutation.mutateAsync({
        priceId: pkg.id,
        userId,
        isOneTime,
        credits: pkg.credits,
        successUrl: `${window.location.origin}/billing?credits_purchased=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("[CREDIT_PURCHASE_ERROR]", error);
      toast({
        title: "Error",
        description: "Failed to initiate credit purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPackageCard = (
    pkg: CreditPackage,
    isOneTime: boolean = false
  ) => (
    <Card key={`${pkg.id}-${isOneTime}`} className='p-6'>
      <div className='space-y-4'>
        <div>
          <h3 className='text-xl font-semibold'>{pkg.id}</h3>
          <p className='text-sm text-gray-500'>{pkg.description}</p>
        </div>

        <div>
          <div className='text-3xl font-bold'>
            ${Number(pkg.monthlyPrice).toFixed(2)}
          </div>
          <div className='text-sm text-gray-500'>{pkg.credits} credits</div>
          {isOneTime && (
            <div className='mt-1 text-sm text-blue-600 font-medium'>
              One-time purchase
            </div>
          )}
        </div>

        <div className='space-y-4'>
          {Array.isArray(pkg.features) && pkg.features.length > 0 && (
            <ul className='space-y-2 text-sm text-gray-600'>
              {pkg.features.map((feature, index) => (
                <li key={index} className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <Button
            className='w-full'
            onClick={() => handlePurchase(pkg, isOneTime)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : null}
            {isOneTime ? "Buy Credits" : "Subscribe"}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className='space-y-8'>
      {/* Current Credits Display */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <h2 className='text-xl font-semibold mb-2'>Your Credits</h2>
        {isLoadingCredits ? (
          <div className='flex items-center'>
            <Loader2 className='h-5 w-5 animate-spin mr-2' />
            <span>Loading credits...</span>
          </div>
        ) : (
          <div className='text-3xl font-bold'>
            {currentCredits || 0} credits
          </div>
        )}
      </div>

      {/* Credit Packages Tabs */}
      <Tabs defaultValue='subscription' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-8'>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          <TabsTrigger value='one-time'>One-Time Purchase</TabsTrigger>
        </TabsList>

        {/* Subscription Packages */}
        <TabsContent value='subscription'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {isLoadingPackages ? (
              <div className='col-span-3 flex justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : creditPackages?.length === 0 ? (
              <div className='col-span-3 text-center py-12 text-gray-500'>
                No credit packages available at the moment.
              </div>
            ) : (
              creditPackages?.map((pkg) => renderPackageCard(pkg))
            )}
          </div>
        </TabsContent>

        {/* One-Time Purchase Packages */}
        <TabsContent value='one-time'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {isLoadingPackages ? (
              <div className='col-span-3 flex justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : creditPackages?.length === 0 ? (
              <div className='col-span-3 text-center py-12 text-gray-500'>
                No credit packages available at the moment.
              </div>
            ) : (
              creditPackages?.map((pkg) => renderPackageCard(pkg, true))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Need More Credits Section */}
      <div className='text-center mt-8'>
        <p className='text-lg text-gray-600'>
          Need more credits?{" "}
          <a
            href='mailto:support@reelty.com'
            className='text-blue-600 hover:underline'
          >
            Contact us
          </a>{" "}
          for custom packages.
        </p>
      </div>
    </div>
  );
}
