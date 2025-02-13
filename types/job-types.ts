import type { User, Listing } from "./prisma-types";

export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: JobStatus;
  progress: number;
  template: string | null;
  inputFiles: string[] | null;
  outputFile: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  listing?: Listing;
}

export interface CreateVideoJobInput {
  listingId: string;
  template?: string;
  inputFiles?: string[];
}

export interface UpdateVideoJobInput {
  status?: JobStatus;
  progress?: number;
  template?: string;
  inputFiles?: string[];
  outputFile?: string;
  error?: string | null;
}

export interface GetVideoJobsParams {
  userId?: string;
  listingId?: string;
  status?: JobStatus;
}

export interface RegenerateVideoInput {
  template?: string;
  inputFiles?: string[];
}
