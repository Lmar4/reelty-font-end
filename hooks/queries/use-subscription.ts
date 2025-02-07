"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { SubscriptionTier } from "@/types/prisma-types";

async function fetchSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const response = await fetch("/api/subscription/tiers");
  if (!response.ok) {
    throw new Error("Failed to fetch subscription tiers");
  }
  return response.json();
}

interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  isOneTime?: boolean;
  credits?: number;
}

async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  const data = await response.json();
  return data.url;
}

interface UpdateSubscriptionParams {
  userId: string;
  tierId: string;
}

async function updateSubscriptionTier(
  data: UpdateSubscriptionParams
): Promise<void> {
  const response = await fetch("/api/subscription/tier", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update subscription");
  }
}

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ["subscriptionTiers"],
    queryFn: fetchSubscriptionTiers,
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
  });
}

export function useUpdateSubscription() {
  return useMutation({
    mutationFn: updateSubscriptionTier,
  });
}
