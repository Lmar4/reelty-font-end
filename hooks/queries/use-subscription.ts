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

async function createCheckoutSession(input: {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const response = await fetch("/api/subscription/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }
  return response.json();
}

async function updateSubscriptionTier(data: {
  userId: string;
  tierId: string;
}): Promise<void> {
  const response = await fetch("/api/subscription/tier", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update subscription");
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
