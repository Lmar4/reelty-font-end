import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../reelty_backend/src/trpc/router";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Property Router Types
export interface Property {
  id: string;
  userId: string;
  address: string;
  photoLimit: number;
  photos: Photo[];
  videoJobs: VideoJob[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  listingId: string;
  filePath: string;
  uploadedAt: Date;
  listing?: Property;
}

// Jobs Router Types
export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  inputFiles: string[];
  outputUrl: string | null;
  template: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  listing?: {
    id: string;
    userId: string;
    address: string;
    photoLimit: number;
    photos: Photo[];
    createdAt: Date;
    updatedAt: Date;
  };
}

// Subscription Router Types
export interface SubscriptionTier {
  id: string;
  description: string;
  pricing: number;
  features: any;
  createdAt: Date;
  updatedAt: Date;
}

// User Router Types
export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  fcmToken?: string;
  listingCredits: ListingCredit[];
  listings?: Property[];
  videoJobs?: VideoJob[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingCredit {
  id: string;
  userId: string;
  creditsRemaining: number;
  purchaseDate: Date;
  expiryDate: Date;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

// TRPC Procedure Types
declare module "@trpc/server" {
  interface RouterRecord {
    property: {
      getById: {
        input: { id: string };
        output: Property;
      };
      getUserListings: {
        input: { userId: string };
        output: Property[];
      };
    };
    jobs: {
      getListingJobs: {
        input: { listingId: string };
        output: VideoJob[];
      };
      getVideoDownloadUrl: {
        input: { jobId: string };
        output: string;
      };
      createVideo: {
        input: {
          listingId: string;
          prompt: string;
        };
        output: VideoJob;
      };
    };
    subscription: {
      getTiers: {
        input: void;
        output: SubscriptionTier[];
      };
      updateTier: {
        input: {
          userId: string;
          tierId: string;
        };
        output: User;
      };
      createCheckoutSession: {
        input: {
          priceId: string;
          userId: string;
          successUrl: string;
          cancelUrl: string;
        };
        output: string;
      };
    };
    user: {
      updateUser: {
        input: {
          id: string;
          name?: string;
          email?: string;
          fcmToken?: string;
        };
        output: User;
      };
    };
  }
}
