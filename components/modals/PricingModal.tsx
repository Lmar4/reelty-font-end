"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useToast } from "@/components/common/Toast";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useUserData } from "@/hooks/useUserData";
import { handleError } from "@/lib/error-handler";
import { Loader2 } from "lucide-react";
import type { RouterOutput } from "@/types/trpc";

type SubscriptionTier = RouterOutput["subscription"]["getTiers"][number];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete: () => void;
  currentTier?: string;
  listingId?: string;
}

export default function PricingModal({
  isOpen,
  onClose,
  onUpgradeComplete,
  currentTier,
  listingId,
}: PricingModalProps) {
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { data: userData } = useUserData();

  const { data: tiers, isLoading } = trpc.subscription.getTiers.useQuery();
  const checkoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      } else {
        showToast("Failed to create checkout session", "error");
      }
      onClose();
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        showToast(error.message, "error");
      } else {
        handleError(error);
      }
      onClose();
    },
  });

  const handleSubscribe = async (tierId: string) => {
    if (!userData?.id) {
      showToast("Please sign in to subscribe", "error");
      return;
    }

    try {
      setSelectedTier(tierId);
      await checkoutMutation.mutateAsync({
        priceId: tierId,
        userId: userData.id,
        successUrl: `${window.location.origin}/dashboard${listingId ? `/${listingId}` : ""}`,
        cancelUrl: `${window.location.origin}${listingId ? `/dashboard/${listingId}` : "/billing"}`,
      });
    } catch (error) {
      // Error is handled by the mutation callbacks
    } finally {
      setSelectedTier(null);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6">
          <Dialog.Title className="text-2xl font-bold mb-6">
            Choose a Plan
          </Dialog.Title>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers?.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                    currentTier === tier.id ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {tier.description}
                    </h3>
                    <p className="text-3xl font-bold mb-4">
                      ${Number(tier.pricing).toFixed(2)}
                      <span className="text-base font-normal text-gray-600">
                        /month
                      </span>
                    </p>
                    <ul className="space-y-3 mb-6">
                      {(tier.features as string[]).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={selectedTier === tier.id || currentTier === tier.id}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedTier === tier.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : currentTier === tier.id ? (
                        "Current Plan"
                      ) : (
                        "Select Plan"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
