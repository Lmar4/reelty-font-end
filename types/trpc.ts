import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../reelty_backend/src/trpc/router";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Common type helpers for components
export type PropertyOutput = NonNullable<RouterOutput["property"]["getById"]>;
export type ListingOutput = RouterOutput["property"]["getUserListings"][number];
export type VideoJobOutput = NonNullable<RouterOutput["jobs"]["getListingJobs"]>[number];
export type UserOutput = NonNullable<RouterOutput["user"]["getUser"]>;
export type TemplateOutput = RouterOutput["adminDashboard"]["getTemplates"][number];
export type AssetOutput = RouterOutput["adminDashboard"]["getAssets"][number];
export type TempUploadOutput = NonNullable<RouterOutput["property"]["getTempUpload"]>;

// Additional type exports
export type FeatureUsageOutput = RouterOutput["adminDashboard"]["getFeatureUsage"];
export type SystemStatsOutput = RouterOutput["adminDashboard"]["getSystemStats"];
export type JobsOutput = RouterOutput["jobs"]["getListingJobs"];
export type SubscriptionTierOutput = RouterOutput["subscription"]["getTiers"][number];

