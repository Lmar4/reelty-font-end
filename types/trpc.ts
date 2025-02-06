import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../reelty_backend/src/trpc/router";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Property Router Types
export interface Property {
  id: string;
  address: string;
  description: string;
  photos: Photo[];
  prompt: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  filePath: string;
  propertyId: string;
  createdAt: Date;
}

// Jobs Router Types
export interface VideoJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  propertyId: string;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Router Types
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

// User Router Types
export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  listingCredits: ListingCredit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingCredit {
  id: string;
  userId: string;
  amount: number;
  expiryDate: Date;
  createdAt: Date;
}
