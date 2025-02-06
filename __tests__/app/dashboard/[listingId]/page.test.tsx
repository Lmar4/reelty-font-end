/// <reference types="vitest" />
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import JobList from "@/components/jobs/JobList";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ListingDetail from "@/app/dashboard/[listingId]/page";
import { useUserData } from "@/hooks/useUserData";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    property: {
      getById: {
        useQuery: vi.fn(),
      },
    },
    jobs: {
      getListingJobs: {
        useQuery: vi.fn(),
      },
      getVideoDownloadUrl: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Mock useUserData
vi.mock("@/hooks/useUserData", () => ({
  useUserData: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ listingId: "listing1" }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

// Mock DashboardLayout
vi.mock("@/components/reelty/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock RegenerateModal
vi.mock("@/components/modals/RegenerateModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, listingId, template, onSuccess }: any) =>
    isOpen ? (
      <div data-testid='regenerate-modal'>
        <button onClick={() => onSuccess()}>Regenerate</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock PricingModal
vi.mock("@/components/modals/PricingModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, listingId, onUpgradeComplete }: any) =>
    isOpen ? (
      <div data-testid='pricing-modal'>
        <div>Premium Template</div>
        <button onClick={() => onUpgradeComplete()}>Upgrade</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock AdditionalPhotosModal
vi.mock("@/components/modals/AdditionalPhotosModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, listingId, onSuccess }: any) =>
    isOpen ? (
      <div data-testid='additional-photos-modal'>
        <button onClick={() => onSuccess()}>Add Photos</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock TanStack Query Client
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

describe("ListingDetail Page", () => {
  const mockJobs = [
    {
      id: "job1",
      userId: "user1",
      listingId: "listing1",
      inputFiles: ["file1.jpg", "file2.jpg"],
      outputFile: "https://example.com/video1.mp4",
      template: "crescendo",
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
      listing: {
        photos: [
          {
            id: "photo1",
            listingId: "listing1",
            filePath: "/photo1.jpg",
            uploadedAt: new Date(),
          },
        ],
      },
    },
    {
      id: "job2",
      userId: "user1",
      listingId: "listing1",
      inputFiles: ["file3.jpg", "file4.jpg"],
      outputFile: null,
      template: "basic",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      listing: {
        photos: [
          {
            id: "photo2",
            listingId: "listing1",
            filePath: "/photo2.jpg",
            uploadedAt: new Date(),
          },
        ],
      },
    },
  ];

  const mockListing = {
    id: "listing1",
    address: "123 Test St",
    photos: [
      {
        id: "photo1",
        listingId: "listing1",
        filePath: "/photo1.jpg",
        uploadedAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (trpc.jobs.getListingJobs.useQuery as any).mockImplementation(() => ({
      data: mockJobs,
      isLoading: false,
      error: null,
    }));
    (trpc.property.getById.useQuery as any).mockImplementation(() => ({
      data: mockListing,
      isLoading: false,
      error: null,
    }));
    (trpc.jobs.getVideoDownloadUrl.useQuery as any).mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue({ data: "https://download.url" }),
    }));
    (useUserData as any).mockImplementation(() => ({
      data: { subscriptionTier: "pro" },
      isLoading: false,
      error: null,
    }));
  });

  it("renders listing details", () => {
    render(<ListingDetail />);
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("displays video jobs", () => {
    render(<ListingDetail />);
    expect(screen.getByText("Crescendo")).toBeInTheDocument();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("shows upgrade button for free users", () => {
    (useUserData as any).mockImplementation(() => ({
      data: { subscriptionTier: "free" },
      isLoading: false,
      error: null,
    }));
    render(<ListingDetail />);
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
  });

  it("handles video download for paid users", async () => {
    render(<ListingDetail />);
    const downloadButton = screen.getAllByText("Download")[0];
    fireEvent.click(downloadButton);
    expect(screen.queryByTestId("pricing-modal")).not.toBeInTheDocument();
  });

  it("shows pricing modal for free users trying to download premium videos", () => {
    (useUserData as any).mockImplementation(() => ({
      data: { subscriptionTier: "free" },
      isLoading: false,
      error: null,
    }));
    render(<ListingDetail />);
    const downloadButton = screen.getAllByText("Download")[0];
    fireEvent.click(downloadButton);
    expect(screen.getByTestId("pricing-modal")).toBeInTheDocument();
    expect(screen.getByText("Premium Template")).toBeInTheDocument();
  });

  it("handles loading state", () => {
    (trpc.jobs.getListingJobs.useQuery as any).mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));
    (trpc.property.getById.useQuery as any).mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));
    render(<ListingDetail />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles error state", () => {
    const error = new Error("Failed to load listing");
    (trpc.property.getById.useQuery as any).mockImplementation(() => ({
      data: null,
      isLoading: false,
      error,
    }));
    render(<ListingDetail />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles regenerate video for failed jobs", () => {
    const failedJob = {
      ...mockJobs[0],
      status: "failed",
    };
    (trpc.jobs.getListingJobs.useQuery as any).mockImplementation(() => ({
      data: [failedJob],
      isLoading: false,
      error: null,
    }));

    render(<ListingDetail />);
    const regenerateButton = screen.getByText("Regenerate");
    fireEvent.click(regenerateButton);
    expect(screen.getByTestId("regenerate-modal")).toBeInTheDocument();
  });

  it("handles additional photos modal after upgrade", () => {
    const router = { replace: vi.fn() };
    vi.mock("next/navigation", () => ({
      useParams: () => ({ listingId: "listing1" }),
      useRouter: () => router,
    }));

    // Mock window.location.search
    const searchParams = new URLSearchParams();
    searchParams.set("upgrade_success", "true");
    Object.defineProperty(window, "location", {
      value: { search: searchParams.toString() },
      writable: true,
    });

    render(<ListingDetail />);
    expect(screen.getByTestId("additional-photos-modal")).toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/dashboard/listing1");
  });
});
