import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { makeBackendRequest } from "@/utils/withAuth";
import { toast } from "sonner";
import { useBaseQuery } from "./queries/useBaseQuery";

interface CreditLog {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface UseCreditsOptions {
  enabled?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function checkCredits(
  token: string,
  userId: string
): Promise<ApiResponse<number>> {
  const data = await makeBackendRequest<{ credits: number }>(
    "/api/credits/check",
    {
      method: "POST",
      body: { userId },
      sessionToken: token,
    }
  );
  return { success: true, data: data.credits };
}

async function deductCredits({
  userId,
  amount,
  reason,
  token,
}: {
  userId: string;
  amount: number;
  reason?: string;
  token: string;
}): Promise<void> {
  await makeBackendRequest<void>("/api/credits/deduct", {
    method: "POST",
    body: { userId, amount, reason },
    sessionToken: token,
  });
}

async function fetchCreditHistory(
  token: string,
  userId: string
): Promise<ApiResponse<CreditLog[]>> {
  const data = await makeBackendRequest<CreditLog[]>(
    `/api/credits/history/${userId}`,
    {
      sessionToken: token,
    }
  );
  return { success: true, data };
}

export function useCredits(userId: string, options: UseCreditsOptions = {}) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const creditsQuery = useBaseQuery(
    ["credits", userId],
    (token) => checkCredits(token, userId),
    {
      enabled: !!userId && options.enabled !== false,
    }
  );

  const historyQuery = useBaseQuery(
    ["creditHistory", userId],
    (token) => fetchCreditHistory(token, userId),
    {
      enabled: !!userId && options.enabled !== false,
    }
  );

  const deductMutation = useMutation({
    mutationFn: async ({
      amount,
      reason,
    }: {
      amount: number;
      reason?: string;
    }) => {
      const token = await getToken();
      return deductCredits({ userId, amount, reason, token: token! });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", userId] });
      queryClient.invalidateQueries({ queryKey: ["creditHistory", userId] });
    },
  });

  return {
    data: creditsQuery.data,
    history: historyQuery.data,
    isLoading: creditsQuery.isLoading || historyQuery.isLoading,
    isError: creditsQuery.isError || historyQuery.isError,
    error: creditsQuery.error || historyQuery.error,
    deductCredits: deductMutation.mutate,
    isDeducting: deductMutation.isPending,
  };
}

export function useCreditCheck() {
  const { userId, getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return checkCredits(token!, userId!);
    },
    onError: (error) => {
      console.error("[CREDIT_CHECK_ERROR]", error);
      toast.error("Failed to check credits");
    },
  });
}

export function useCreditDeduction() {
  const { userId, getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      reason,
    }: {
      amount: number;
      reason?: string;
    }) => {
      const token = await getToken();
      return deductCredits({ userId: userId!, amount, reason, token: token! });
    },
    onError: (error) => {
      console.error("[CREDIT_DEDUCTION_ERROR]", error);
      toast.error("Failed to deduct credits");
    },
  });
}
