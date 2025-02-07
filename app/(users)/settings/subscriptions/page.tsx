"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/queries/use-user";
import {
  useSubscriptionTiers,
  useUpdateSubscription,
} from "@/hooks/queries/use-subscription";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CancelSubscriptionDialog } from "@/components/reelty/CancelSubscriptionDialog";
import { User, SubscriptionTier } from "@/types/prisma-types";

export default function SubscriptionsSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null
  );
  const { data: userData } = useUser(currentUser?.id || "");
  const { data: subscriptionTiers } = useSubscriptionTiers();
  const updateSubscriptionMutation = useUpdateSubscription();

  const handleSubscriptionUpdate = async () => {
    if (!userData?.id || !selectedTier) return;

    try {
      setIsUpdating(true);
      await updateSubscriptionMutation.mutateAsync({
        userId: userData.id,
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
    if (!userData?.id || !userData?.stripeSubscriptionId) return;

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          stripeSubscriptionId: userData.stripeSubscriptionId,
          reason,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      throw error;
    }
  };

  const currentTier = subscriptionTiers?.find(
    (tier) => tier.id === userData?.currentTierId
  );

  const calculatePriceDifference = (newTier: SubscriptionTier) => {
    if (!currentTier) return newTier.monthlyPrice;
    return newTier.monthlyPrice - currentTier.monthlyPrice;
  };

  const formatNextBillingDate = () => {
    if (!userData?.subscriptionPeriodEnd) return "";
    return new Date(userData.subscriptionPeriodEnd).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

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
          {userData?.subscriptionStatus === "active" && (
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
          {subscriptionTiers?.map((tier) => (
            <div
              key={tier.id}
              className='border rounded-lg p-6 hover:shadow-lg transition-shadow'
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
              <button
                onClick={() => setSelectedTier(tier)}
                disabled={isUpdating || userData?.currentTierId === tier.id}
                className='w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {userData?.currentTierId === tier.id
                  ? "Current Plan"
                  : "Select Plan"}
              </button>
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
                      ${calculatePriceDifference(selectedTier).toFixed(2)}/month{" "}
                      {calculatePriceDifference(selectedTier) > 0
                        ? "increase"
                        : "decrease"}
                    </p>
                  </div>
                  {selectedTier.features.length > 0 && (
                    <div>
                      <p className='font-medium mb-2'>New Features:</p>
                      <ul className='list-disc list-inside'>
                        {selectedTier.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className='text-sm text-gray-500'>
                    Your subscription will be updated immediately, and the new
                    pricing will be reflected in your next billing cycle.
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
              Confirm Change
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
