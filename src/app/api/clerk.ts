import { Clerk } from '@clerk/backend';

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable');
}

const clerk = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default clerk; 