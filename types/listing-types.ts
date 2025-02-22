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
  listingId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  template?: string | null;
  inputFiles?: any;
  outputFile: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    userMessage?: string;
    error?: string;
    stage?: "webp" | "runway" | "template" | "final";
    currentFile?: number;
    totalFiles?: number;
    startTime?: string;
    endTime?: string;
  } | null;
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
