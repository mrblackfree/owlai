import { createHandler } from "@/server/api/handler";
import { z } from "zod";
import { Tool } from '../db/models/Tool';
import connectDB from '../db/connection';
import mongoose from 'mongoose';

const toolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  pricing: z.object({
    type: z.enum(["free", "freemium", "paid", "enterprise"], {
      required_error: "Please select a pricing type",
    }),
    startingPrice: z.number().optional(),
  }),
  features: z.array(z.string()).min(1, "Add at least one feature"),
  logo: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "pending", "approved", "rejected"]).default("draft"),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  views: z.number().default(0),
  votes: z.number().default(0),
  rating: z.number().default(0),
  reviews: z.number().default(0),
  slug: z.string().optional(),
});

const handler = createHandler();

// Add a function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric character with a dash
    .replace(/^-+|-+$/g, '') // Remove leading and trailing dashes
    .replace(/-+/g, '-'); // Replace multiple consecutive dashes with a single dash
};

// Get dashboard statistics
handler.get('/stats', async (req, res) => {
  try {
    console.log('GET /api/tools/stats - Fetching dashboard statistics');
    await connectDB();

    const stats = await Promise.all([
      // Total tools count
      Tool.countDocuments({ status: 'published' }),
      // Pending submissions count
      Tool.countDocuments({ status: 'pending' }),
      // Tools by category
      Tool.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // Recent tools
      Tool.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category createdAt'),
      // Popular tools (by views)
      Tool.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .select('name views'),
      // Tools by status
      Tool.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // Tools by pricing type
      Tool.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$pricing.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return res.json({
      totalTools: stats[0],
      pendingSubmissions: stats[1],
      categoryCounts: stats[2],
      recentTools: stats[3],
      popularTools: stats[4],
      statusCounts: stats[5],
      pricingCounts: stats[6]
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get all tool submissions (pending tools)
handler.get('/submissions', async (req, res) => {
  try {
    console.log('GET /api/tools/submissions - Fetching tool submissions');
    await connectDB();

    const submissions = await Tool.find({ status: 'pending' }).sort({ createdAt: -1 });
    console.log('GET /api/tools/submissions - Found', submissions.length, 'submissions');

    return res.json(submissions);
  } catch (error) {
    console.error('Error fetching tool submissions:', error);
    return res.status(500).json({ error: 'Failed to fetch tool submissions' });
  }
});

// Get all tools
handler.get('/', async (req, res) => {
  try {
    console.log('GET /api/tools - Fetching tools');
    await connectDB();

    const tools = await Tool.find({ status: 'published' }).sort({ createdAt: -1 });
    console.log('GET /api/tools - Found', tools.length, 'tools');
    console.log('Sample tool:', JSON.stringify(tools[0], null, 2));

    // Transform the data to match the expected format
    const formattedTools = tools.map(tool => ({
      _id: tool._id.toString(),
      id: tool._id.toString(), // Keep id for backward compatibility
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      websiteUrl: tool.websiteUrl,
      url: tool.websiteUrl, // Add url field for frontend compatibility
      website: new URL(tool.websiteUrl).hostname, // Add website field for frontend
      category: tool.category,
      tags: tool.tags,
      pricing: {
        type: tool.pricing.type,
        startingPrice: tool.pricing.startingPrice?.toString() || '0',
      },
      features: tool.features,
      status: tool.status,
      isTrending: tool.isTrending,
      isNew: tool.isNew,
      views: tool.views.toString(),
      votes: tool.votes,
      rating: tool.rating,
      reviews: tool.reviews,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
      logo: tool.logo // Include the logo field
    }));

    console.log('Formatted sample:', JSON.stringify(formattedTools[0], null, 2));
    return res.json(formattedTools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get single tool by ID or slug
handler.get('/:idOrSlug', async (req, res) => {
  try {
    console.log('GET /api/tools/:idOrSlug - Fetching tool:', req.params.idOrSlug);
    await connectDB();

    // Try to find by slug first
    let tool = await Tool.findOne({ slug: req.params.idOrSlug });
    
    // If not found by slug, try to find by ID
    if (!tool && mongoose.Types.ObjectId.isValid(req.params.idOrSlug)) {
      tool = await Tool.findById(req.params.idOrSlug);
    }

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Increment views
    tool.views += 1;
    await tool.save();

    // Format the response
    const formattedTool = {
      _id: tool._id.toString(),
      id: tool._id.toString(),
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      websiteUrl: tool.websiteUrl,
      url: tool.websiteUrl,
      website: new URL(tool.websiteUrl).hostname,
      category: tool.category,
      tags: tool.tags,
      pricing: {
        type: tool.pricing.type,
        startingPrice: tool.pricing.startingPrice?.toString() || '0',
      },
      features: tool.features,
      status: tool.status,
      isTrending: tool.isTrending,
      isNew: tool.isNew,
      views: tool.views.toString(),
      votes: tool.votes,
      rating: tool.rating,
      reviews: tool.reviews,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
      logo: tool.logo
    };

    return res.json(formattedTool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// Create new tool
handler.post('/', async (req, res) => {
  try {
    await connectDB();
    const toolData = toolSchema.parse(req.body);
    
    // Generate slug from name if not provided
    const slug = toolData.slug || generateSlug(toolData.name);
    
    // Check if slug already exists
    const existingTool = await Tool.findOne({ slug });
    if (existingTool) {
      // If slug exists, append a random number
      const randomSuffix = Math.floor(Math.random() * 1000);
      toolData.slug = `${slug}-${randomSuffix}`;
    } else {
      toolData.slug = slug;
    }

    const newTool = new Tool({
      ...toolData,
      status: 'pending'
    });

    await newTool.save();
    return res.status(201).json(newTool);
  } catch (error) {
    console.error('Error creating tool:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create tool' });
  }
});

// Update tool
handler.patch('/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = toolSchema.partial().parse(req.body);

    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    return res.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update tool' });
  }
});

// Delete tool
handler.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    const deletedTool = await Tool.findByIdAndDelete(id);
    if (!deletedTool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return res.status(500).json({ error: 'Failed to delete tool' });
  }
});

// Update tool status
handler.patch('/:id/status', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status } = z.object({
      status: z.enum(["draft", "published", "archived", "pending", "approved", "rejected"])
    }).parse(req.body);

    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    return res.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update tool status' });
  }
});

export const toolsHandler = handler; 