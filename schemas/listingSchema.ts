import { z } from "zod";

export const listingSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  status: z.enum(["draft", "pending", "active", "archived"] as const),
  photoLimit: z.number().min(1).max(50).default(10),
});

export const photoSchema = z.object({
  filePath: z.string().url("Invalid file path"),
  order: z.number().min(0),
});

export const videoJobSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"] as const),
  template: z.string().optional(),
  inputFiles: z.array(z.string()).optional(),
  outputFile: z.string().url("Invalid output file URL").optional(),
  error: z.string().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
export type PhotoFormData = z.infer<typeof photoSchema>;
export type VideoJobFormData = z.infer<typeof videoJobSchema>;
