import type { User, Listing } from "./prisma-types";

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  tiers: string[];
  order: number;
  thumbnailUrl?: string;
  subscriptionTiers?: {
    id: string;
    name: string;
  }[];
}

export interface PhotoUpload {
  s3Key: string;
  filePath?: string;
}

export interface Photo {
  id: string;
  userId: string;
  listingId: string;
  filePath: string;
  s3Key: string;
  status: string;
  error?: string | null;
  processedFilePath?: string | null;
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  template?: string | null;
  inputFiles?: string[] | null;
  outputFile?: string | null;
  error?: string | null;
  position: number;
  priority: number;
  metadata?: {
    userMessage?: string;
    error?: string;
    stage?: "webp" | "runway" | "template" | "final";
    currentFile?: number;
    totalFiles?: number;
    startTime?: string;
    endTime?: string;
    currentStage?: "runway" | "template" | "upload";
    currentSubStage?: string;
    stepsCompleted?: string[];
    templateResults?: Array<{
      status: "SUCCESS" | "FAILED";
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
      thumbnailUrl?: string;
    }>;
    allTemplates?: Array<{
      path: string;
      template: string;
      isPrimary: boolean;
    }>;
    mapVideo?: {
      path: string;
      coordinates: { lat: number; lng: number };
      generatedAt: string;
    };
    lastUpdated?: string;
  } | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  listing?: Listing;

  thumbnailUrl?: string;
}

export interface CreateListingInput {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  photoLimit?: number;
  photos: PhotoUpload[];
}

export interface ProcessedPhoto {
  uiId: string;
  originalFile: File;
  webpBlob: Blob;
  previewUrl: string;
  s3Key?: string;
  status: "idle" | "processing" | "completed" | "error";
}

export interface UploadResult {
  s3Key: string;
  url: string;
}
