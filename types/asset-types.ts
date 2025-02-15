import type { Asset as PrismaAsset, AssetType } from "./prisma-types";

export type { AssetType, PrismaAsset as Asset };

export interface GetAssetsParams {
  type?: AssetType;
  includeInactive?: boolean;
}

export interface CreateAssetInput {
  name: string;
  description?: string;
  type: AssetType;
  subscriptionTier: string;
  file: File;
}

export interface UpdateAssetInput {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssetUploadResponse {
  id: string;
  filePath: string;
  uploadUrl: string;
}

export interface AssetDownloadResponse {
  downloadUrl: string;
  expiresAt: Date;
}

export interface AssetStats {
  totalAssets: number;
  byType: Record<AssetType, number>;
  byTier: Record<string, number>;
  activeAssets: number;
  totalStorage: number; // in bytes
}
