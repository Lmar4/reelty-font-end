import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface CreditCheck {
  userId: string;
  templateId: string;
  features: string[];
}

interface CreditDeduction {
  userId: string;
  templateId: string;
  features: string[];
  listingId: string;
}

interface CreditLog {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface UseCreditsOptions {
  enabled?: boolean;
}

async function checkCredits(userId: string, token: string): Promise<number> {
  const response = await fetch("/api/credits/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to check credits");
  }

  const data = await response.json();
  return data.credits;
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
  const response = await fetch("/api/credits/deduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, amount, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to deduct credits");
  }
}

async function fetchCreditHistory(
  userId: string,
  token: string
): Promise<CreditLog[]> {
  const response = await fetch(`/api/credits/history/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch credit history");
  }

  const data = await response.json();
  return data.history;
}

export function useCredits(userId: string, options: UseCreditsOptions = {}) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const creditsQuery = useQuery({
    queryKey: ["credits", userId],
    queryFn: async () => {
      const token = await getToken();
      return checkCredits(userId, token!);
    },
    enabled: !!userId && options.enabled !== false,
  });

  const historyQuery = useQuery({
    queryKey: ["creditHistory", userId],
    queryFn: async () => {
      const token = await getToken();
      return fetchCreditHistory(userId, token!);
    },
    enabled: !!userId && options.enabled !== false,
  });

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
      // Invalidate credits query to trigger a refresh
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
      return checkCredits(userId!, token!);
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
