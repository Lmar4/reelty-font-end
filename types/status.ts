export enum VideoGenerationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface PhotoProcessingStatus {
  processingCount: number;
  failedCount: number;
  totalCount: number;
  status: VideoGenerationStatus;
  message: string;
}
