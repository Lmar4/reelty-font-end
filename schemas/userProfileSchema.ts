import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
