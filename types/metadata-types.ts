import { JsonValue } from "./prisma-types";

export interface VideoJobMetadata {
  processedTemplates?: Array<{ key: string; path: string }>;
  userMessage?: string;
  error?: string;
  stage?: string;
  currentFile?: string;
  totalFiles?: number;
  startTime?: string;
  endTime?: string;
  [key: string]: JsonValue | undefined;
}

export interface ListingMetadata {
  [key: string]: JsonValue | undefined;
}

export interface PhotoMetadata {
  [key: string]: JsonValue | undefined;
}

export interface AssetMetadata {
  [key: string]: JsonValue | undefined;
}
