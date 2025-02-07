import { z } from "zod";
import { AssetType } from "@/types/prisma-types";

export const assetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["MUSIC", "WATERMARK", "LOTTIE"] as const),
  subscriptionTier: z.enum(["basic", "pro", "enterprise"] as const),
  filePath: z.string().url("Invalid file path"),
  isActive: z.boolean().default(true),
});

export type AssetFormData = z.infer<typeof assetSchema>;
