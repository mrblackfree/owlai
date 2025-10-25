import { clerkClient } from '@clerk/express';
import { createHandler } from "@/server/api/handler";
import { z } from "zod";

const userRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'moderator', 'user']),
  reason: z.string().min(1),
});

const userStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'suspended', 'banned']),
  reason: z.string().min(1),
});

// const ADMIN_EMAIL_DOMAINS = ["webbuddy.agency"];

// const isAdminEmail = (email: string) => {
//   return ADMIN_EMAIL_DOMAINS.some(domain => email.endsWith(`@${domain}`));
// };

const handler = createHandler()
  // Get all users
  .get('/', async (req, res) => {
    try {
      console.log('Fetching users list from Clerk');
      
      // Get auth header
      const authHeader = req.headers.authorization;
      console.log('Auth header:', authHeader ? 'Present' : 'Missing');

      // Use environment secret key
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not found in environment');
      }

      // Initialize Clerk client with secret key
      const clerk = clerkClient;
      
      const usersResponse = await clerk.users.getUserList({
        limit: 100,
        orderBy: '-created_at'
      });
      
      console.log(`Found ${usersResponse.data.length} users`);
      
      const formattedUsers = usersResponse.data.map(user => {
        const email = user.emailAddresses[0]?.emailAddress;
        console.log('Processing user:', {
          id: user.id,
          email,
          metadata: user.publicMetadata
        });
        
        return {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          email: email || '',
          role: (user.publicMetadata?.role as string) || 'user',
          status: (user.publicMetadata?.status as string) || 'active',
          lastActive: user.lastSignInAt || user.createdAt,
          joinedAt: user.createdAt,
          avatarUrl: user.imageUrl,
        };
      });

      console.log('Returning formatted users:', formattedUsers.length);
      return res.json(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })

  // Get user activity
  .get('/user/:userId/activity', async (req, res) => {
    try {
      let { userId } = req.params;
      console.log('Activity request for userId:', userId);
      
      // Clean and validate userId
      userId = userId.replace('user_', '');
      const fullUserId = `user_${userId}`;
      
      console.log('Fetching activity for user:', fullUserId);
      const user = await clerkClient.users.getUser(fullUserId);
      const activities = (user.privateMetadata?.activities || []) as any[];

      return res.json(activities);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  })

  // Update user role
  .patch('/user/:userId/role', async (req, res) => {
    try {
      console.log('Role update request:', {
        params: req.params,
        body: req.body,
        headers: req.headers
      });

      const { role, reason } = userRoleSchema.parse({
        ...req.body,
        userId: req.params.userId
      });

      // Clean and validate userId
      let userId = req.params.userId.replace('user_', '');
      const fullUserId = `user_${userId}`;
      
      console.log('Processing role update for:', fullUserId);
      
      // Get auth header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('Invalid auth header:', authHeader);
        return res.status(401).json({ error: 'Invalid authorization header' });
      }

      // Fetch existing user
      console.log('Fetching user data for:', fullUserId);
      const existingUser = await clerkClient.users.getUser(fullUserId);
      console.log('Found user:', existingUser.id);

      // Update metadata
      const updatedMetadata = {
        ...existingUser.publicMetadata,
        role,
        roleUpdatedAt: new Date().toISOString(),
        roleUpdateReason: reason,
      };

      console.log('Updating user metadata:', updatedMetadata);
      const user = await clerkClient.users.updateUser(fullUserId, {
        publicMetadata: updatedMetadata,
      });

      // Add activity
      const currentActivities = (user.privateMetadata?.activities || []) as any[];
      await clerkClient.users.updateUser(fullUserId, {
        privateMetadata: {
          activities: [
            {
              id: `act_${Date.now()}`,
              type: 'role_change',
              description: `Role changed to ${role}`,
              metadata: { previousRole: existingUser.publicMetadata?.role, newRole: role, reason },
              timestamp: new Date().toISOString(),
            },
            ...currentActivities.slice(0, 99),
          ],
        },
      });

      console.log('Successfully updated user role');
      return res.json({ success: true, user });
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ 
        error: 'Failed to update user role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })

  // Update user status
  .patch('/user/:userId/status', async (req, res) => {
    try {
      let { userId } = req.params;
      if (!userId.startsWith('user_')) {
        userId = `user_${userId}`;
      }

      const { status, reason } = userStatusSchema.parse({
        ...req.body,
        userId
      });

      const user = await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          status,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdateReason: reason,
        },
      });

      // Handle user locking through Clerk's API
      if (status === 'banned') {
        await clerkClient.users.lockUser(userId);
      } else if (status === 'active') {
        await clerkClient.users.unlockUser(userId);
      }

      // Add activity
      const currentActivities = (user.privateMetadata?.activities || []) as any[];
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          activities: [
            {
              id: `act_${Date.now()}`,
              type: 'status_change',
              description: `Status changed to ${status}`,
              metadata: { previousStatus: user.publicMetadata?.status, newStatus: status, reason },
              timestamp: new Date().toISOString(),
            },
            ...currentActivities.slice(0, 99),
          ],
        },
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Error updating user status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  })

  // Set admin role for a user
  .post('/user_:userId/set-admin-role', async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('Received request to set admin role for user:', userId);
      
      // Get the full user ID by adding back the prefix
      const fullUserId = `user_${userId}`;
      
      const user = await clerkClient.users.getUser(fullUserId);
      console.log('Found user:', {
        id: user.id,
        emails: user.emailAddresses.map(e => e.emailAddress)
      });
      
      // Check if user has an authorized email domain
      // const hasAuthorizedEmail = user.emailAddresses.some(email => 
      //   isAdminEmail(email.emailAddress)
      // );

      // console.log('Email authorization check:', {
      //   hasAuthorizedEmail,
      //   allowedDomains: ADMIN_EMAIL_DOMAINS
      // });

      // if (!hasAuthorizedEmail) {
      //   return res.status(403).json({ 
      //     error: "User email domain not authorized for admin role" 
      //   });
      // }

      // Update user's role to admin
      const updateData = {
        publicMetadata: {
          ...user.publicMetadata,
          role: 'admin',
          roleUpdatedAt: new Date().toISOString()
        }
      };

      console.log('Updating user with data:', updateData);

      await clerkClient.users.updateUser(fullUserId, updateData);
      console.log('Successfully updated user role to admin');

      return res.json({ success: true });
    } catch (error) {
      console.error('Error setting admin role:', error);
      return res.status(500).json({ 
        error: 'Failed to set admin role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

export const usersHandler = handler; 