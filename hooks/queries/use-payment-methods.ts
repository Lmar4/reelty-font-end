import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBaseQuery } from "./useBaseQuery";
import { makeBackendRequest } from "@/utils/withAuth";
import { ApiResponse } from "@/types/api-types";

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
      if (!customerId)
        return {
          success: true,
          data: [],
        };
      return makeBackendRequest<ApiResponse<PaymentMethod[]>>(
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
      const response = await makeBackendRequest<
        ApiResponse<SetupIntentResponse>
      >("/api/payment/setup-intent", {
        method: "POST",
        body: { customerId },
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to create setup intent");
      }
      return response.data;
    },
  });
}

export function useDeletePaymentMethod() {
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await makeBackendRequest<ApiResponse<void>>(
        "/api/payment/method",
        {
          method: "DELETE",
          body: { paymentMethodId },
        }
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to delete payment method");
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
      const response = await makeBackendRequest<ApiResponse<void>>(
        "/api/payment/method/default",
        {
          method: "POST",
          body: { customerId, paymentMethodId },
        }
      );
      if (!response.success) {
        throw new Error(
          response.error || "Failed to update default payment method"
        );
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
