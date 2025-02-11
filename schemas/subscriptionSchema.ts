import { z } from "zod";
import { isValidTierId } from "@/constants/subscription-tiers";

export const subscriptionTierSchema = z.object({
  id: z
    .string()
    .uuid()
    .refine((val) => isValidTierId(val), {
      message: "Invalid subscription tier ID",
    }),
  name: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stripePriceId: z.string(),
  stripeProductId: z.string(),
  features: z.array(z.string()),
  monthlyPrice: z.number().min(0, "Price cannot be negative"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const subscriptionStatusSchema = z.enum([
  "ACTIVE",
  "CANCELED",
  "INCOMPLETE",
  "INCOMPLETE_EXPIRED",
  "PAST_DUE",
  "TRIALING",
  "UNPAID",
  "INACTIVE",
]);

export const tierChangeSchema = z.object({
  userId: z.string(),
  oldTier: z.string().uuid(),
  newTier: z.string().uuid(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  adminId: z.string().optional(),
});

export const creditLogSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  adminId: z.string().optional(),
});

export const listingCreditSchema = z.object({
  userId: z.string(),
  creditsRemaining: z.number().min(0, "Credits cannot be negative"),
  expiryDate: z.date(),
});

export const subscriptionLogSchema = z.object({
  userId: z.string(),
  action: z.enum(["create", "update", "cancel", "reactivate"]),
  stripeSubscriptionId: z.string(),
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
  status: subscriptionStatusSchema,
  periodEnd: z.date().optional(),
});

export type SubscriptionTierFormData = z.infer<typeof subscriptionTierSchema>;
export type TierChangeFormData = z.infer<typeof tierChangeSchema>;
export type CreditLogFormData = z.infer<typeof creditLogSchema>;
export type ListingCreditFormData = z.infer<typeof listingCreditSchema>;
export type SubscriptionLogFormData = z.infer<typeof subscriptionLogSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
