export enum AssetType {
  MUSIC = "MUSIC",
  WATERMARK = "WATERMARK",
  LOTTIE = "LOTTIE",
}

export interface Asset {
  id: string;
  name: string;
  description?: string | null;
  filePath: string;
  type: AssetType;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssetInput {
  name: string;
  description?: string;
  filePath: string;
  type: AssetType;
  subscriptionTier: string;
  isActive?: boolean;
}

export interface UpdateAssetInput {
  id: string;
  name?: string;
  description?: string;
  filePath?: string;
  type?: AssetType;
  subscriptionTier?: string;
  isActive?: boolean;
}

export interface GetAssetsParams {
  type?: AssetType;
  includeInactive?: boolean;
}
