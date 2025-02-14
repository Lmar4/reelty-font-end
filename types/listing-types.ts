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

export interface Photo {
  id: string;
  userId: string;
  listingId: string;
  filePath: string;
  processedFilePath: string | null;
  order: number;
  status: string;
  error: string | null;
  runwayVideoPath: string | null;
  createdAt: Date;
  updatedAt: Date;
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
}
