import { Photo } from "./prisma-types";

interface VideoJobMetadata {
  message?: string;
  mapVideo?: {
    path: string;
    coordinates: { lat: number; lng: number };
    generatedAt: string;
  };
  lastUpdated?: string;
  currentStage?: "runway" | "template" | "upload";
  currentSubStage?: string;
  stepsCompleted?: string[];
  templateResults?: Array<{
    status: "SUCCESS" | string;
    template: string;
    timestamp: number;
    processingTime: number;
  }>;
  templates?: Array<{
    path: string;
    success: boolean;
    template: string;
  }>;
  defaultTemplate?: string;
  processedTemplates?: Array<{
    key: string;
    path: string;
  }>;
  allTemplates?: Array<{
    path: string;
    template: string;
    isPrimary: boolean;
  }>;
}

interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  template: string | null;
  inputFiles: string[] | null;
  outputFile: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  position: number;
  priority: number;
  metadata: VideoJobMetadata | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  startedAt: string | Date | null;
  completedAt: string | Date | null;
}

export interface ListingData {
  id: string;
  userId: string;
  address: string;
  description: string | null;
  coordinates: { lat: number; lng: number };
  status: "ACTIVE" | string;
  photoLimit: number;
  metadata: Record<string, unknown>;
  photos: Photo[];
  videoJobs: VideoJob[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
