"use client";

import { CancelSubscriptionDialog } from "@/components/reelty/CancelSubscriptionDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSubscriptionTiers,
  useUpdateSubscription,
} from "@/hooks/queries/use-subscription";
import { useUserData } from "@/hooks/queries/use-user";
import { SubscriptionTier } from "@/types/prisma-types";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscriptionsSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null
  );
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUserData();
  const {
    data: subscriptionTiers,
    isLoading: isLoadingTiers,
    error: tiersError,
  } = useSubscriptionTiers();
  const updateSubscriptionMutation = useUpdateSubscription();

  const handleSubscriptionUpdate = async () => {
    if (!user?.data?.id || !selectedTier) return;

    try {
      setIsUpdating(true);
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      // If user has no subscription, create a new checkout session
      if (!user.data.stripeSubscriptionId) {
        const response = await fetch("/api/subscription/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.data.id,
            tierId: selectedTier.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { sessionId } = await response.json();
        // Use Stripe.js to redirect to checkout
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw error;
        return;
      }

      // If user has an existing subscription, update it
      await updateSubscriptionMutation.mutateAsync({
        tierId: selectedTier.id,
      });

      toast.success("Subscription updated successfully");
      setSelectedTier(null);
    } catch (error) {
      console.error("Subscription update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update subscription"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    if (!user?.data?.id || !user?.data?.stripeSubscriptionId) return;

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.data.id,
          stripeSubscriptionId: user.data.stripeSubscriptionId,
          reason,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      setIsCancelling(false);
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    }
  };

  const currentTier = subscriptionTiers?.data?.find(
    (tier) => tier.id === user?.data?.currentTierId
  );

  const calculatePriceDifference = (newTier: SubscriptionTier) => {
    if (!currentTier) return newTier.monthlyPrice;
    return newTier.monthlyPrice - currentTier.monthlyPrice;
  };

  const formatNextBillingDate = () => {
    if (!user?.data?.subscriptionPeriodEnd) return "";
    return new Date(user.data.subscriptionPeriodEnd).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  if (isUserLoading || isLoadingTiers) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Show error state if there's an error
  if (userError || tiersError) {
    return (
      <div className='p-4 bg-red-50 rounded-lg mt-8'>
        <h2 className='text-xl font-semibold text-red-700 mb-2'>
          Error loading subscription data
        </h2>
        <p className='text-red-600'>
          {userError instanceof Error
            ? userError.message
            : tiersError instanceof Error
            ? tiersError.message
            : "Please try again later"}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Subscription Management
        </h1>
        <p className='text-muted-foreground'>
          View and manage your subscription plan and billing preferences.
        </p>
      </div>

      <div className='space-y-8'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h2 className='font-medium text-blue-800 mb-2'>
            Current Subscription
          </h2>
          <p className='text-blue-600'>
            {currentTier?.name || "No active subscription"}
          </p>
          {user?.data?.subscriptionStatus === "ACTIVE" && (
            <>
              <p className='text-sm text-blue-600 mt-2'>
                Next billing date: {formatNextBillingDate()}
              </p>
              <Button
                variant='outline'
                onClick={() => setIsCancelling(true)}
                className='mt-4 text-red-600 border-red-200 hover:bg-red-50'
              >
                Cancel Subscription
              </Button>
            </>
          )}
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {subscriptionTiers?.data?.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-lg p-6 transition-shadow ${
                user?.data?.currentTierId === tier.id
                  ? "border-primary bg-primary/5"
                  : "hover:shadow-lg"
              }`}
            >
              <h3 className='text-xl font-semibold mb-2'>{tier.name}</h3>
              <p className='text-gray-600 mb-4'>{tier.description}</p>
              <p className='text-2xl font-bold mb-6'>
                ${tier.monthlyPrice.toFixed(2)}/mo
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
              <Button
                onClick={() => setSelectedTier(tier)}
                disabled={isUpdating || user?.data?.currentTierId === tier.id}
                className='w-full'
                variant={
                  user?.data?.currentTierId === tier.id ? "outline" : "default"
                }
              >
                {user?.data?.currentTierId === tier.id
                  ? "Current Plan"
                  : "Select Plan"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedTier} onOpenChange={() => setSelectedTier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Change</DialogTitle>
            <DialogDescription>
              {selectedTier && (
                <div className='mt-4 space-y-4'>
                  <p>
                    You are about to change your subscription from{" "}
                    <strong>{currentTier?.name || "No Plan"}</strong> to{" "}
                    <strong>{selectedTier.name}</strong>.
                  </p>
                  <div className='bg-gray-50 p-4 rounded-md'>
                    <p className='font-medium'>Price Change:</p>
                    <p className='text-lg'>
                      $
                      {Math.abs(calculatePriceDifference(selectedTier)).toFixed(
                        2
                      )}
                      /month{" "}
                      {calculatePriceDifference(selectedTier) > 0
                        ? "increase"
                        : "decrease"}
                    </p>
                  </div>
                  {selectedTier.features.length > 0 && (
                    <div>
                      <p className='font-medium mb-2'>Features:</p>
                      <ul className='list-disc list-inside'>
                        {selectedTier.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className='text-sm text-gray-500'>
                    {user?.data?.stripeSubscriptionId
                      ? "Your subscription will be updated immediately, and the new pricing will be reflected in your next billing cycle."
                      : "You will be redirected to Stripe to complete your subscription purchase."}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setSelectedTier(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSubscriptionUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {user?.data?.stripeSubscriptionId
                ? "Confirm Change"
                : "Subscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CancelSubscriptionDialog
        isOpen={isCancelling}
        onClose={() => setIsCancelling(false)}
        onConfirm={handleCancelSubscription}
        planName={currentTier?.name || ""}
        nextBillingDate={formatNextBillingDate()}
      />
    </div>
  );
}
