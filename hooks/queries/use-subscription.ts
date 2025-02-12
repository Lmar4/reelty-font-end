"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
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
  previousPriceId?: string | null;
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

const SUBSCRIPTION_QUERY_KEY = "subscription";

export function useSubscription() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEY],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscription/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch subscription");
      }

      const result = await response.json();
      return result.data;
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: { tierId: string }) => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscription/tier`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update subscription");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
      toast.success("Subscription updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscription/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
      toast.success("Subscription cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });
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
