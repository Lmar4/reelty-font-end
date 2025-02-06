import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Invalid email address"),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional(),
  subscriptionTier: z.string().uuid().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Validation helper
export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};
