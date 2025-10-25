import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { toolsHandler } from './api/tools.js';
import { blogHandler } from './api/blog.js';
import { newsHandler } from './api/news.js';
import { salesInquiriesHandler } from './api/salesInquiries.js';

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  // Add CORS headers to all responses
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PATCH') {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/tools', toolsHandler.middleware());
app.use('/api/blog', blogHandler.middleware());
app.use('/api/news', newsHandler.middleware());
app.use('/api/sales-inquiries', salesInquiriesHandler.middleware());

// Users API endpoint
app.get('/api/users', async (req, res) => {
  try {
    console.log('Fetching users from Clerk');
    const { data: users } = await clerkClient.users.getUserList();
    console.log('Got users from Clerk:', users.length);

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

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
}); 