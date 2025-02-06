/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import BillingPage from "@/components/billing/BillingPage";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      getTiers: {
        useQuery: vi.fn(),
      },
      createCheckoutSession: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BillingPage", () => {
  const mockTiers = [
    {
      id: "basic",
      description: "Basic Plan",
      pricing: "9.99",
      features: ["Feature 1", "Feature 2"],
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "pro",
      description: "Pro Plan",
      pricing: "19.99",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    vi.clearAllMocks();
    (trpc.subscription.getTiers.useQuery as any).mockImplementation(() => ({
      data: mockTiers,
      isLoading: false,
      error: null,
    }));
    (useAuth as any).mockImplementation(() => ({
      user: { uid: "test-user-id" },
    }));

    // Store the original window object
    originalWindow = window;
    // Create a mock window object
    const windowMock = {
      ...window,
      location: {
        ...window.location,
        href: "",
        origin: "http://localhost:3000",
      },
    };
    // @ts-expect-error - we're mocking window
    global.window = windowMock;
  });

  afterEach(() => {
    // Restore the original window object
    global.window = originalWindow;
  });

  it("displays loading state", () => {
    (trpc.subscription.getTiers.useQuery as any).mockImplementation(() => ({
      isLoading: true,
    }));

    render(<BillingPage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays subscription tiers", () => {
    render(<BillingPage />);

    mockTiers.forEach((tier) => {
      expect(screen.getByText(tier.description)).toBeInTheDocument();
      expect(screen.getByText(`$${tier.pricing}`)).toBeInTheDocument();
      (tier.features as string[]).forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  it("handles subscription upgrade", async () => {
    const mockCheckoutUrl = "https://checkout.stripe.com/test";
    const mockCreateCheckout = vi.fn().mockResolvedValue(mockCheckoutUrl);

    (
      trpc.subscription.createCheckoutSession.useMutation as any
    ).mockImplementation(() => ({
      mutateAsync: mockCreateCheckout,
    }));

    render(<BillingPage />);

    // Click subscribe button for the pro plan
    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[1]); // Pro plan button

    // Verify checkout was created with correct parameters
    expect(mockCreateCheckout).toHaveBeenCalledWith({
      priceId: "pro",
      userId: "test-user-id",
      successUrl: "http://localhost:3000/dashboard",
      cancelUrl: "http://localhost:3000/billing",
    });
    expect(window.location.href).toBe(mockCheckoutUrl);
  });

  it("handles checkout error", async () => {
    const mockError = new Error("Failed to create checkout session");
    const mockCreateCheckout = vi.fn().mockRejectedValue(mockError);

    (
      trpc.subscription.createCheckoutSession.useMutation as any
    ).mockImplementation(() => ({
      mutateAsync: mockCreateCheckout,
    }));

    render(<BillingPage />);

    // Click subscribe button for the basic plan
    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[0]); // Basic plan button

    // Verify error toast was shown
    expect(mockCreateCheckout).toHaveBeenCalledWith({
      priceId: "basic",
      userId: "test-user-id",
      successUrl: "http://localhost:3000/dashboard",
      cancelUrl: "http://localhost:3000/billing",
    });
    expect(toast.error).toHaveBeenCalledWith(mockError.message);
  });

  it("shows error when user is not authenticated", () => {
    (useAuth as any).mockImplementation(() => ({
      user: null,
    }));

    render(<BillingPage />);

    const subscribeButtons = screen.getAllByText("Subscribe");
    fireEvent.click(subscribeButtons[0]);

    expect(toast.error).toHaveBeenCalledWith("Please sign in to subscribe");
  });
});
