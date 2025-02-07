import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

async function checkCredits(userId: string): Promise<number> {
  const response = await fetch("/api/credits/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
}: {
  userId: string;
  amount: number;
  reason?: string;
}): Promise<void> {
  const response = await fetch("/api/credits/deduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, amount, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to deduct credits");
  }
}

async function fetchCreditHistory(userId: string): Promise<CreditLog[]> {
  const response = await fetch(`/api/credits/history/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch credit history");
  }

  const data = await response.json();
  return data.history;
}

export function useCredits(userId: string, options: UseCreditsOptions = {}) {
  const queryClient = useQueryClient();

  const creditsQuery = useQuery({
    queryKey: ["credits", userId],
    queryFn: () => checkCredits(userId),
    enabled: !!userId && options.enabled !== false,
  });

  const historyQuery = useQuery({
    queryKey: ["creditHistory", userId],
    queryFn: () => fetchCreditHistory(userId),
    enabled: !!userId && options.enabled !== false,
  });

  const deductMutation = useMutation({
    mutationFn: deductCredits,
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
  return useMutation({
    mutationFn: checkCredits,
    onError: (error) => {
      console.error("[CREDIT_CHECK_ERROR]", error);
      toast.error("Failed to check credits");
    },
  });
}

export function useCreditDeduction() {
  return useMutation({
    mutationFn: deductCredits,
    onError: (error) => {
      console.error("[CREDIT_DEDUCTION_ERROR]", error);
      toast.error("Failed to deduct credits");
    },
  });
}
