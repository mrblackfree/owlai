import { Clerk } from '@clerk/clerk-react';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

export const clerk = new Clerk({
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
}); 