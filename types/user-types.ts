export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  fcmToken?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  fcmToken?: string;
}

export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: "pending" | "processing" | "completed" | "failed";
  template: string;
  inputFiles: string[];
  outputFile?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoJobInput {
  listingId: string;
  template: string;
  inputFiles: string[];
}

export interface UpdateVideoJobInput {
  status?: "pending" | "processing" | "completed" | "failed";
  outputFile?: string;
  error?: string;
}

export interface GetVideoJobsParams {
  listingId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface RegenerateVideoInput {
  template?: string;
  inputFiles?: string[];
}
