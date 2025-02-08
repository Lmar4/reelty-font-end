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
import { useTemplates } from "@/__tests__/mocks/use-templates";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all the hooks
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/queries/use-listings", () => ({
  useListings: vi.fn(),
  useCreateListing: vi.fn(),
  useUploadPhoto: vi.fn(),
}));

vi.mock("@/__tests__/mocks/use-templates");

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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

describe("DashboardPage", () => {
  const mockUser = {
    id: "user-123",
    fullName: "Test User",
  };

  const mockCreateListing = vi.fn();
  const mockUploadPhoto = vi.fn();
  const mockCreateJob = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    // Mock useUser
    (useUser as any).mockReturnValue({ user: mockUser });

    // Mock useListings
    (useListings as any).mockReturnValue({ data: [], isLoading: false });

    // Mock useCreateListing
    (useCreateListing as any).mockReturnValue({
      mutateAsync: mockCreateListing,
    });

    // Mock useUploadPhoto
    (useUploadPhoto as any).mockReturnValue({
      mutateAsync: mockUploadPhoto,
    });

    // Mock useTemplates
    vi.mocked(useTemplates).mockReturnValue({
      data: [
        {
          id: "template-1",
          name: "Test Template",
          description: "Test Description",
        },
      ],
      isLoading: false,
      error: null,
    });
  });

  it("should handle successful listing creation flow", async () => {
    const mockListing = {
      id: "listing-123",
      address: "123 Test St",
    };

    mockCreateListing.mockResolvedValueOnce(mockListing);
    mockUploadPhoto.mockResolvedValueOnce({ filePath: "path/to/photo.jpg" });

    renderWithClient(<DashboardPage />);

    // Select files
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the address input to be enabled and interact with it
    const addressInput = await screen.findByRole("textbox", {
      name: /property address/i,
    });
    expect(addressInput).not.toBeDisabled();

    fireEvent.change(addressInput, { target: { value: "123 Test St" } });

    // Wait for and click the suggestion
    const suggestion = await screen.findByText("123 Test St");
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(mockCreateListing).toHaveBeenCalledWith({
        userId: mockUser.id,
        address: "123 Test St",
        coordinates: expect.any(Object),
        photoLimit: 10,
      });
    });

    await waitFor(() => {
      expect(mockUploadPhoto).toHaveBeenCalledWith({
        file,
        listingId: mockListing.id,
        order: 0,
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Listing created successfully")
    );
  });

  it("should handle listing creation error", async () => {
    mockCreateListing.mockRejectedValueOnce(
      new Error("Failed to create listing")
    );

    renderWithClient(<DashboardPage />);

    // Select files
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the address input to be enabled and interact with it
    const addressInput = await screen.findByRole("textbox", {
      name: /property address/i,
    });
    expect(addressInput).not.toBeDisabled();

    fireEvent.change(addressInput, { target: { value: "123 Test St" } });

    // Wait for and click the suggestion
    const suggestion = await screen.findByText("123 Test St");
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create listing");
    });

    expect(mockUploadPhoto).not.toHaveBeenCalled();
  });

  it("should handle photo upload error", async () => {
    const mockListing = {
      id: "listing-123",
      address: "123 Test St",
    };

    mockCreateListing.mockResolvedValueOnce(mockListing);
    mockUploadPhoto.mockRejectedValueOnce(new Error("Failed to upload photo"));

    renderWithClient(<DashboardPage />);

    // Select files
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the address input to be enabled and interact with it
    const addressInput = await screen.findByRole("textbox", {
      name: /property address/i,
    });
    expect(addressInput).not.toBeDisabled();

    fireEvent.change(addressInput, { target: { value: "123 Test St" } });

    // Wait for and click the suggestion
    const suggestion = await screen.findByText("123 Test St");
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to upload photo");
    });
  });
});
