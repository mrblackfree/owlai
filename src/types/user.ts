export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'banned';
  lastActive: string;
  joinedAt: string;
  avatarUrl?: string;
} 