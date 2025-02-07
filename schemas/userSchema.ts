import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subscriptionTier: z.enum(["free", "basic", "pro", "enterprise"] as const),
  fcmToken: z.string().optional(),
});

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export const searchHistorySchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
});

export const errorLogSchema = z.object({
  error: z.string(),
  stack: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type SearchHistoryFormData = z.infer<typeof searchHistorySchema>;
export type ErrorLogFormData = z.infer<typeof errorLogSchema>;
