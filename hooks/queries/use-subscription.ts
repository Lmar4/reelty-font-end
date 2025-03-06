"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { makeBackendRequest } from "@/utils/withAuth";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types/prisma-types";
import { useBaseQuery } from "./useBaseQuery";
import { ApiResponse } from "@/types/api-types";
import { unwrapQueryResult } from "@/utils/unwrapApiResponse";

interface SubscriptionData {
  id: string;
  status: string;
  currentTier: SubscriptionTier;
  periodEnd: string | null;
}

async function fetchSubscriptionTiers(
  token: string
): Promise<ApiResponse<SubscriptionTier[]>> {
  return makeBackendRequest<ApiResponse<SubscriptionTier[]>>(
    "/api/subscription/tiers",
    {
      sessionToken: token,
    }
  );
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
): Promise<ApiResponse<{ url: string }>> {
  if (!token) throw new Error("No token provided");
  return makeBackendRequest<ApiResponse<{ url: string }>>(
    "/api/create-checkout-session",
    {
      method: "POST",
      body: params,
      sessionToken: token,
    }
  );
}

interface UpdateSubscriptionParams {
  userId: string;
  tierId: string;
  previousPriceId?: string | null;
}

async function updateSubscriptionTier(
  data: UpdateSubscriptionParams,
  token?: string
): Promise<ApiResponse<void>> {
  if (!token) throw new Error("No token provided");
  return makeBackendRequest<ApiResponse<void>>("/api/subscription/tier", {
    method: "PATCH",
    body: data,
    sessionToken: token,
  });
}

const SUBSCRIPTION_QUERY_KEY = "subscription";

export function useSubscription() {
  const result = useBaseQuery<SubscriptionData>(
    [SUBSCRIPTION_QUERY_KEY],
    (token) => {
      return makeBackendRequest<ApiResponse<SubscriptionData>>(
        "/api/subscription/current",
        {
          sessionToken: token,
        }
      );
    }
  );

  return unwrapQueryResult(result);
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (data: { tierId: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      if (!userId) throw new Error("User ID not found");
      const response = await updateSubscriptionTier(
        { userId, tierId: data.tierId },
        token
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to update subscription");
      }
      return response.data;
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
      const response = await makeBackendRequest<ApiResponse<void>>(
        "/api/subscription/cancel",
        {
          method: "POST",
          sessionToken: token,
        }
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to cancel subscription");
      }
      return response.data;
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
  const result = useBaseQuery<SubscriptionTier[]>(
    ["subscriptionTiers"],
    (token) => fetchSubscriptionTiers(token)
  );

  return unwrapQueryResult(result);
}

export function useCreateCheckoutSession() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      const token = await getToken();
      const response = await createCheckoutSession(params, token || undefined);
      if (!response.success) {
        throw new Error(response.error || "Failed to create checkout session");
      }
      return response.data.url;
    },
  });
}
