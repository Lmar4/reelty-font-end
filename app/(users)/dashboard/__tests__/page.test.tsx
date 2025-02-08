import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DashboardPage from "../page";
import { useUser } from "@clerk/nextjs";
import {
  useListings,
  useCreateListing,
  useUploadPhoto,
} from "@/hooks/queries/use-listings";
import { useTemplates } from "@/hooks/queries/use-templates";
import { useCreateJob } from "@/hooks/use-jobs";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all the hooks
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
  useAuth: () => ({
    userId: "user_123",
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock("@/hooks/queries/use-listings", () => ({
  useListings: vi.fn(),
  useCreateListing: vi.fn(),
  useUploadPhoto: vi.fn(),
}));

vi.mock("@/hooks/queries/use-templates", () => ({
  useTemplates: vi.fn(),
}));

vi.mock("@/hooks/use-jobs", () => ({
  useCreateJob: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock router
const mockRouter = { push: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock Google Places API
vi.mock("use-places-autocomplete", () => ({
  default: () => ({
    ready: true,
    value: "",
    suggestions: {
      status: "OK",
      data: [{ place_id: "1", description: "123 Test St" }],
    },
    setValue: vi.fn(),
    clearSuggestions: vi.fn(),
  }),
  getGeocode: () => Promise.resolve([{}]),
  getLatLng: () => Promise.resolve({ lat: 40.7128, lng: -74.006 }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

interface Template {
  id: string;
  name: string;
  description: string;
  sequence: any;
  durations: any;
  subscriptionTier: string;
  isActive: boolean;
  musicPath?: string;
  musicVolume?: number;
}

describe("DashboardPage", () => {
  const mockUser = {
    id: "user_123",
    publicMetadata: {
      tier: "free",
    },
  };

  const mockListings = [
    {
      id: "listing_1",
      address: "123 Test St",
      photos: [{ filePath: "/test-image.jpg" }],
    },
  ];

  const mockTemplates: Template[] = [
    {
      id: "template_1",
      name: "Test Template",
      description: "A test template",
      sequence: ["intro", "photos", "outro"],
      durations: { intro: 3, photo: 3, outro: 3 },
      subscriptionTier: "free",
      isActive: true,
    },
  ];

  // Mock implementation for mutations
  const mockCreateListingMutation = {
    mutateAsync: vi.fn(),
  };

  const mockUploadPhotoMutation = {
    mutateAsync: vi.fn(),
  };

  const mockCreateJobMutation = {
    mutateAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockRouter.push.mockClear();

    // Mock useUser
    (useUser as any).mockReturnValue({ user: mockUser });

    // Mock useListings
    (useListings as any).mockReturnValue({
      data: mockListings,
      isLoading: false,
    });

    // Mock useCreateListing
    (useCreateListing as any).mockReturnValue(mockCreateListingMutation);

    // Mock useUploadPhoto
    (useUploadPhoto as any).mockReturnValue(mockUploadPhotoMutation);

    // Mock useTemplates
    (useTemplates as any).mockReturnValue({
      data: mockTemplates,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      fetchStatus: "idle",
      isError: false,
      isFetching: false,
      isLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetching: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: true,
      refetch: vi.fn(),
      status: "success",
    });

    // Mock useCreateJob
    (useCreateJob as any).mockReturnValue(mockCreateJobMutation);
  });

  it("renders the dashboard page with header", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Your Listings")).toBeInTheDocument();
  });

  it("displays existing listings", () => {
    render(<DashboardPage />);
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("shows empty state when no listings exist", () => {
    (useListings as any).mockReturnValue({ data: [], isLoading: false });
    render(<DashboardPage />);
    expect(screen.getByText("Create your first Reelty!")).toBeInTheDocument();
  });

  it("shows loading state while fetching listings", () => {
    (useListings as any).mockReturnValue({ isLoading: true });
    render(<DashboardPage />);
    // Add assertion for loading state once implemented
  });

  describe("Listing Creation Flow", () => {
    const mockFiles = [new File(["test"], "test.jpg", { type: "image/jpeg" })];

    it("validates maximum number of files", async () => {
      renderWithClient(<DashboardPage />);
      const fileInput = screen.getByTestId("file-input");
      const tooManyFiles = Array(11).fill(
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      // Trigger file selection with too many files
      fireEvent.change(fileInput, { target: { files: tooManyFiles } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Maximum 10 photos allowed");
      });
    });

    it("shows template selection modal after file selection", async () => {
      render(<DashboardPage />);

      // Get the file input and simulate file selection
      const fileInput = screen.getByTestId("file-input");
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText("New Listing Reels")).toBeInTheDocument();
      });
    });

    it("shows address input modal after template selection", async () => {
      render(<DashboardPage />);

      // First simulate file selection
      const fileInput = screen.getByTestId("file-input");
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      fireEvent.change(fileInput, { target: { files } });

      // Wait for the modal to show
      await waitFor(() => {
        expect(screen.getByText("New Listing Reels")).toBeInTheDocument();
      });

      // The address input should be visible immediately
      expect(screen.getByLabelText("Listing Address")).toBeInTheDocument();
    });

    it("creates listing successfully", async () => {
      // Mock successful API calls
      mockCreateListingMutation.mutateAsync.mockResolvedValue({
        id: "new_listing_1",
      });
      mockUploadPhotoMutation.mutateAsync.mockResolvedValue({
        filePath: "/uploaded.jpg",
      });
      mockCreateJobMutation.mutateAsync.mockResolvedValue({ id: "job_1" });

      renderWithClient(<DashboardPage />);

      // 1. Simulate file selection
      const fileInput = screen.getByTestId("file-input");
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      fireEvent.change(fileInput, { target: { files } });

      // 2. Wait for template modal and select a template
      await waitFor(() => {
        expect(screen.getByText("Select Template")).toBeInTheDocument();
      });

      const templateCard = screen
        .getByText("Test Template")
        .closest("[role='button']");
      fireEvent.click(templateCard!);

      // 3. Wait for address input and fill it
      await waitFor(() => {
        expect(screen.getByText("Enter Property Address")).toBeInTheDocument();
      });

      const addressInput = screen.getByTestId("address-input");
      fireEvent.change(addressInput, { target: { value: "123 Test St" } });

      // 4. Select the first suggestion
      await waitFor(() => {
        const suggestion = screen.getByTestId("address-suggestion-1");
        fireEvent.click(suggestion);
      });

      // 5. Submit the form
      const submitButton = screen.getByRole("button", {
        name: "Create Listing",
      });
      fireEvent.click(submitButton);

      // 6. Check loading states
      await waitFor(() => {
        expect(screen.getByText("Creating listing...")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText("Preparing photos for upload...")
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Listing created successfully! Video generation has started."
        );
      });
    });

    it("handles listing creation error", async () => {
      // Mock API error
      mockCreateListingMutation.mutateAsync.mockRejectedValue(
        new Error("Failed to create listing")
      );

      render(<DashboardPage />);

      // 1. Simulate file selection
      const fileInput = screen.getByTestId("file-input");
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      fireEvent.change(fileInput, { target: { files } });

      // 2. Wait for modal and fill address
      await waitFor(() => {
        const addressInput = screen.getByPlaceholderText(
          "Enter listing address"
        );
        fireEvent.change(addressInput, { target: { value: "123 Test St" } });
      });

      // 3. Select the first suggestion
      await waitFor(() => {
        const suggestions = screen.getAllByText("123 Test St");
        // Click the first suggestion (the one in the dropdown)
        fireEvent.click(suggestions[0]);
      });

      // 4. Submit the form
      const submitButton = screen.getByRole("button", {
        name: "Create Listing",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to create listing");
      });
    });

    it("shows progress during listing creation", async () => {
      // Mock slow but successful API calls
      mockCreateListingMutation.mutateAsync.mockResolvedValue({
        id: "new_listing_1",
      });
      mockUploadPhotoMutation.mutateAsync.mockResolvedValue({
        filePath: "/uploaded.jpg",
      });
      mockCreateJobMutation.mutateAsync.mockResolvedValue({ id: "job_1" });

      renderWithClient(<DashboardPage />);

      // 1. Simulate file selection
      const fileInput = screen.getByTestId("file-input");
      const files = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
      fireEvent.change(fileInput, { target: { files } });

      // 2. Wait for template modal and select a template
      await waitFor(() => {
        expect(screen.getByText("Select Template")).toBeInTheDocument();
      });

      const templateCard = screen
        .getByText("Test Template")
        .closest("[role='button']");
      fireEvent.click(templateCard!);

      // 3. Wait for address input and fill it
      await waitFor(() => {
        expect(screen.getByText("Enter Property Address")).toBeInTheDocument();
      });

      const addressInput = screen.getByTestId("address-input");
      fireEvent.change(addressInput, { target: { value: "123 Test St" } });

      // 4. Select the first suggestion
      await waitFor(() => {
        const suggestion = screen.getByTestId("address-suggestion-1");
        fireEvent.click(suggestion);
      });

      // 5. Submit the form
      const submitButton = screen.getByRole("button", {
        name: "Create Listing",
      });
      fireEvent.click(submitButton);

      // Check for loading states in sequence
      await waitFor(() => {
        expect(screen.getByText("Creating listing...")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText("Preparing photos for upload...")
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Listing created successfully! Video generation has started."
        );
      });
    });
  });
});
