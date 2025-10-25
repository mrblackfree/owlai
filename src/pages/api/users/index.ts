import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = auth();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify admin role
    const admin = await auth().getUser();
    if (admin.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Requires admin role' });
    }

    const users = await auth().clerkClient.users.getUserList({
      limit: 100,
      orderBy: '-created_at',
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress || '',
      role: (user.publicMetadata?.role as string) || 'user',
      status: (user.publicMetadata?.status as string) || 'active',
      lastActive: user.lastSignInAt || user.createdAt,
      joinedAt: user.createdAt,
      avatarUrl: user.imageUrl,
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 