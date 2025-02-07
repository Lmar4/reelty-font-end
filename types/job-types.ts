export interface VideoJob {
  id: string;
  userId: string;
  listingId: string;
  status: string;
  template?: string | null;
  inputFiles?: any | null;
  outputFile?: string | null;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoJobInput {
  listingId: string;
  template?: string;
  inputFiles?: any;
}

export interface UpdateVideoJobInput {
  id: string;
  status?: string;
  template?: string;
  inputFiles?: any;
  outputFile?: string;
  error?: string;
}

export interface GetVideoJobsParams {
  userId?: string;
  listingId?: string;
  status?: string;
}

export interface RegenerateVideoInput {
  listingId: string;
  template?: string;
}
