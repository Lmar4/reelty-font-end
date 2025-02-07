import { z } from "zod";

export const subscriptionTierSchema = z.object({
  id: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricing: z.number().min(0, "Price cannot be negative"),
  isAdmin: z.boolean().default(false),
  features: z.array(z.string()),
});

export const tierChangeSchema = z.object({
  oldTier: z.string(),
  newTier: z.string(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const creditLogSchema = z.object({
  amount: z.number(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const listingCreditSchema = z.object({
  creditsRemaining: z.number().min(0, "Credits cannot be negative"),
  expiryDate: z.date(),
});

export type SubscriptionTierFormData = z.infer<typeof subscriptionTierSchema>;
export type TierChangeFormData = z.infer<typeof tierChangeSchema>;
export type CreditLogFormData = z.infer<typeof creditLogSchema>;
export type ListingCreditFormData = z.infer<typeof listingCreditSchema>;
