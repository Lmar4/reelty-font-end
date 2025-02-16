import { z } from "zod";

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const listingFormSchema = z.object({
  address: z.string().min(1, "Address is required"),
  coordinates: coordinatesSchema,
  photoLimit: z.number().min(1).max(10).default(1),
}).refine((data) => {
  return data.address && data.coordinates;
}, {
  message: "Both address and coordinates are required",
  path: ["address"],
});

export const photoUploadSchema = z.object({
  file: z.instanceof(File),
  listingId: z.string().min(1),
  order: z.number().optional(),
  s3Key: z.string().optional(),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type ListingFormData = z.infer<typeof listingFormSchema>;
export type PhotoUploadData = z.infer<typeof photoUploadSchema>;
