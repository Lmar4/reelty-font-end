import { User, UserRole, SubscriptionStatus } from './prisma-types';

// Type for User data returned from the API
export interface UserResource {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  // Add any other fields that the API actually returns
}

// Type guard to check if a UserResource has all required User fields
export function isFullUser(user: UserResource): user is User {
  return (
    'password' in user &&
    'stripeCustomerId' in user &&
    'stripeSubscriptionId' in user &&
    'stripePriceId' in user &&
    'stripeProductId' in user &&
    'subscriptionPeriodEnd' in user &&
    'currentTierId' in user &&
    'lastLoginAt' in user &&
    'createdAt' in user &&
    'updatedAt' in user &&
    'agencyId' in user
  );
}

// Helper to transform UserResource to partial User
export function toPartialUser(resource: UserResource): Partial<User> {
  return {
    id: resource.id,
    email: resource.email,
    firstName: resource.firstName,
    lastName: resource.lastName,
    role: resource.role,
    subscriptionStatus: resource.subscriptionStatus,
  };
}
