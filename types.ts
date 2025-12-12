// types.ts

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // This flag will be stored on our mock user object
  hasCompletedOnboarding: boolean;

  // Optional profile completeness fields from backend
  isProfileComplete?: boolean;
  location?: string;
  pushTokens?: string[];
}
