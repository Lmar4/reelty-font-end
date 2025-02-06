/// <reference types="vitest" />
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import JobSubmissionForm from "@/components/forms/JobSubmissionForm";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    jobs: {
      submit: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("JobSubmissionForm", () => {
  const mockProps = {
    listingId: "test-listing-id",
    userId: "test-user-id",
    onSuccess: vi.fn(),
    selectedPhotos: ["photo1.jpg", "photo2.jpg"],
  };

  const mockMutateAsync = vi.fn();
  let mutationCallbacks: { onSuccess?: Function; onError?: Function } = {};

  const mockUseMutation = vi.fn((options = {}) => {
    mutationCallbacks = options;
    return {
      mutateAsync: mockMutateAsync,
      isLoading: false,
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCallbacks = {};
    (trpc.jobs.submit.useMutation as any).mockImplementation(mockUseMutation);
  });

  it("renders correctly", () => {
    render(<JobSubmissionForm {...mockProps} />);

    expect(screen.getByText("Create Video")).toBeInTheDocument();
    expect(screen.getByText("2 photos selected")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("shows warning when no photos are selected", () => {
    render(<JobSubmissionForm {...mockProps} selectedPhotos={[]} />);

    expect(
      screen.getByText(
        "No photos selected. Please select photos to generate a video."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles successful job submission", async () => {
    const jobId = "test-job-id";
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockMutateAsync.mockImplementation(() => promise);

    render(<JobSubmissionForm {...mockProps} />);

    const submitButton = screen.getByRole("button", { name: /submit job/i });

    // Click the button and wait for state updates
    await act(async () => {
      fireEvent.click(submitButton);
      // Wait for the next tick to allow state updates
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Verify mutation call
    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: mockProps.userId,
      listingId: mockProps.listingId,
      inputFiles: mockProps.selectedPhotos,
      template: "crescendo",
    });

    // Resolve the mutation and trigger callbacks
    await act(async () => {
      resolvePromise!({ id: jobId });
      await promise;
      mutationCallbacks.onSuccess?.({ id: jobId });
      // Wait for the next tick to allow state updates
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify success state
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Video generation job submitted successfully!"
      );
      expect(mockProps.onSuccess).toHaveBeenCalledWith(jobId);
      expect(submitButton).toBeEnabled();
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  it("handles submission error", async () => {
    const error = new Error("Test error");
    let rejectPromise: (error: Error) => void;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    mockMutateAsync.mockImplementation(() => promise);

    render(<JobSubmissionForm {...mockProps} />);

    const submitButton = screen.getByRole("button", { name: /submit job/i });

    // Click the button and wait for state updates
    await act(async () => {
      fireEvent.click(submitButton);
      // Wait for the next tick to allow state updates
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Verify mutation call
    expect(mockMutateAsync).toHaveBeenCalled();

    // Reject the mutation and trigger callbacks
    await act(async () => {
      rejectPromise!(error);
      try {
        await promise;
      } catch {
        mutationCallbacks.onError?.(error);
      }
      // Wait for the next tick to allow state updates
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify error state
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Test error");
      expect(submitButton).toBeEnabled();
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  it("uses default template when not provided", async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: "test-id" });

    render(<JobSubmissionForm {...mockProps} />);

    const submitButton = screen.getByRole("button", { name: /submit job/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          template: "crescendo",
        })
      );
    });
  });

  it("uses custom template when provided", async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: "test-id" });

    render(<JobSubmissionForm {...mockProps} template='custom-template' />);

    const submitButton = screen.getByRole("button", { name: /submit job/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          template: "custom-template",
        })
      );
    });
  });
});
