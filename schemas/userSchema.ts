import { z } from "zod";
import { subscriptionStatusSchema } from "./subscriptionSchema";
import { isValidTierId } from "@/constants/subscription-tiers";

export const userSchema = z.object({
  id: z.string(), // Clerk ID
  email: z.string().email("Invalid email address"),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  stripePriceId: z.string().nullable(),
  stripeProductId: z.string().nullable(),
  subscriptionStatus: subscriptionStatusSchema.nullable().default("inactive"),
  subscriptionPeriodEnd: z.date().nullable(),
  currentTierId: z
    .string()
    .uuid()
    .nullable()
    .refine((val) => val === null || isValidTierId(val), {
      message: "Invalid subscription tier ID",
    }),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const searchHistorySchema = z.object({
  userId: z.string(),
  query: z.string().min(1, "Search query cannot be empty"),
});

export const errorLogSchema = z.object({
  userId: z.string().optional(),
  error: z.string(),
  stack: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type SearchHistoryFormData = z.infer<typeof searchHistorySchema>;
export type ErrorLogFormData = z.infer<typeof errorLogSchema>;
