import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBaseQuery } from "./useBaseQuery";
import { makeBackendRequest } from "@/utils/withAuth";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface SetupIntentResponse {
  clientSecret: string;
}

export function usePaymentMethods(customerId?: string) {
  return useBaseQuery<PaymentMethod[]>(
    ["paymentMethods", customerId],
    async (token) => {
      if (!customerId) return [];
      return makeBackendRequest<PaymentMethod[]>(
        `/api/payment/methods?customerId=${customerId}`,
        {
          sessionToken: token,
        }
      );
    },
    {
      enabled: !!customerId,
    }
  );
}

export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch("/api/payment/setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId }),
      });
      if (!response.ok) {
        throw new Error("Failed to create setup intent");
      }
      const data = await response.json();
      return data.data as SetupIntentResponse;
    },
  });
}

export function useDeletePaymentMethod() {
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await fetch("/api/payment/method", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }
    },
    onSuccess: () => {
      toast.success("Payment method deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete payment method"
      );
    },
  });
}

export function useUpdateDefaultPaymentMethod() {
  return useMutation({
    mutationFn: async ({
      customerId,
      paymentMethodId,
    }: {
      customerId: string;
      paymentMethodId: string;
    }) => {
      const response = await fetch("/api/payment/method/default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId, paymentMethodId }),
      });
      if (!response.ok) {
        throw new Error("Failed to update default payment method");
      }
    },
    onSuccess: () => {
      toast.success("Default payment method updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update default payment method"
      );
    },
  });
}
