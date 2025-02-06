import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BillingPage from "@/components/billing/BillingPage";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/hooks/useAuth";
import type { Mock } from "vitest";

// Mock the trpc client
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      getTiers: {
        useQuery: () => ({
          data: [
            {
              id: "basic",
              description: "Basic plan with essential features",
              pricing: 9.99,
              features: ["Feature 1", "Feature 2"],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "pro",
              description: "Professional plan with advanced features",
              pricing: 29.99,
              features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          isLoading: false,
        }),
      },
      createCheckoutSession: {
        useMutation: () => ({
          mutateAsync: vi
            .fn()
            .mockResolvedValue("https://checkout.stripe.com/test"),
          mutate: vi.fn(),
          data: null,
          error: null,
          isError: false,
          isIdle: true,
          isLoading: false,
          isSuccess: false,
          reset: vi.fn(),
          status: "idle",
          variables: undefined,
          context: undefined,
          failureCount: 0,
          failureReason: null,
          isPaused: false,
          trpc: { path: "subscription.createCheckoutSession" },
        }),
      },
    },
  },
}));

// Mock the toast hook
vi.mock("@/components/common/Toast", () => ({
  useToast: vi.fn(),
}));

// Mock the auth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("BillingPage", () => {
  const mockShowToast = vi.fn();
  const mockUser = { uid: "test-user-id" };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as Mock).mockReturnValue({ showToast: mockShowToast });
    (useAuth as Mock).mockReturnValue({ user: mockUser });
  });

  it("renders subscription tiers", () => {
    render(<BillingPage />);

    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
  });

  it("handles subscription when user is signed in", async () => {
    render(<BillingPage />);

    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(window.location.href).toBe("https://checkout.stripe.com/test");
    });
  });

  it("shows error when user is not signed in", async () => {
    (useAuth as Mock).mockReturnValue({ user: null });

    render(<BillingPage />);

    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Please sign in to subscribe",
        "error"
      );
    });
  });

  it("handles subscription error", async () => {
    const errorMessage = "Failed to create subscription";

    vi.mocked(
      trpc.subscription.createCheckoutSession.useMutation
    ).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error(errorMessage)),
      mutate: vi.fn(),
      data: null,
      error: null,
      isError: false as const,
      isIdle: true as const,
      isLoading: false as const,
      isSuccess: false as const,
      reset: vi.fn(),
      status: "idle" as const,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      trpc: { path: "subscription.createCheckoutSession" },
    } as any);

    render(<BillingPage />);

    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, "error");
    });
  });

  it("shows loading state", () => {
    vi.mocked(trpc.subscription.getTiers.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<BillingPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
