import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadPhoto, useCreateListing } from "../use-listings";
import { toast } from "sonner";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock("sonner");

describe("use-listings hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useUploadPhoto", () => {
    it("should throw error when listingId is undefined", async () => {
      const { result } = renderHook(() => useUploadPhoto(), { wrapper });

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            file,
            listingId: undefined as unknown as string,
            order: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Listing ID is required");
        }
      });

      expect(toast.error).toHaveBeenCalledWith("Listing ID is required");
    });

    it("should successfully upload photo with valid listingId", async () => {
      const mockResponse = { filePath: "path/to/photo.jpg" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useUploadPhoto(), { wrapper });

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const listingId = "valid-listing-id";

      await act(async () => {
        const response = await result.current.mutateAsync({
          file,
          listingId,
          order: 0,
        });

        expect(response).toEqual(mockResponse);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/listings/${listingId}/photos`,
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Server Error",
      });

      const { result } = renderHook(() => useUploadPhoto(), { wrapper });

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            file,
            listingId: "valid-id",
            order: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Failed to upload photo");
        }
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to upload photo");
    });
  });
});
