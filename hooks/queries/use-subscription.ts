"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { makeBackendRequest } from "@/utils/withAuth";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types/prisma-types";
import { useBaseQuery } from "./useBaseQuery";

async function fetchSubscriptionTiers(
  token: string
): Promise<SubscriptionTier[]> {
  return makeBackendRequest<SubscriptionTier[]>("/api/subscription/tiers", {
    sessionToken: token,
  });
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
  params: CreateCheckoutSessionParams,
  token?: string
): Promise<string> {
  if (!token) throw new Error("No token provided");
  const data = await makeBackendRequest<{ url: string }>(
    "/api/create-checkout-session",
    {
      method: "POST",
      body: params,
      sessionToken: token,
    }
  );
  return data.url;
}

interface UpdateSubscriptionParams {
  userId: string;
  tierId: string;
  previousPriceId?: string | null;
}

async function updateSubscriptionTier(
  data: UpdateSubscriptionParams,
  token?: string
): Promise<void> {
  if (!token) throw new Error("No token provided");
  await makeBackendRequest<void>("/api/subscription/tier", {
    method: "PATCH",
    body: data,
    sessionToken: token,
  });
}

const SUBSCRIPTION_QUERY_KEY = "subscription";

export function useSubscription() {
  return useBaseQuery([SUBSCRIPTION_QUERY_KEY], (token) => {
    return makeBackendRequest<any>("/api/subscription/current", {
      sessionToken: token,
    });
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: { tierId: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      if (!userId) throw new Error("User ID not found");
      await updateSubscriptionTier({ userId, tierId: data.tierId }, token);
      return;
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
      if (!token) throw new Error("Authentication token not found");
      return makeBackendRequest<any>("/api/subscription/cancel", {
        method: "POST",
        sessionToken: token,
      });
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
  return useBaseQuery(["subscriptionTiers"], (token) =>
    fetchSubscriptionTiers(token)
  );
}

export function useCreateCheckoutSession() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      const token = await getToken();
      return createCheckoutSession(params, token || undefined);
    },
  });
}
