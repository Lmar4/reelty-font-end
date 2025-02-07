export interface User {
  id: string; // Clerk ID
  email: string;
  firstName: string | null;
  lastName: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: Date | null;
  currentTierId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
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
