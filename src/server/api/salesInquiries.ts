import { createHandler } from "./handler.js";
import { z } from "zod";
import { SalesInquiry } from '../db/models/SalesInquiry.js';
import connectDB from '../db/connection.js';

const salesInquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(1, "Company name is required"),
  monthlyBudget: z.string().min(1, "Please select a monthly budget"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const handler = createHandler();

// Get all sales inquiries
handler.get('/', async (req, res) => {
  try {
    console.log('GET /api/sales-inquiries - Fetching inquiries');
    await connectDB();
    const inquiries = await SalesInquiry.find().sort({ submittedAt: -1 });
    return res.json(inquiries);
  } catch (error) {
    console.error('Error fetching sales inquiries:', error);
    return res.status(500).json({ error: 'Failed to fetch sales inquiries' });
  }
});

// Create new sales inquiry
handler.post('/', async (req, res) => {
  try {
    console.log('POST /api/sales-inquiries - Creating inquiry:', req.body);
    
    // Check for authentication
    if (!req.auth?.userId) {
      console.error('POST /api/sales-inquiries - Unauthorized attempt');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await connectDB();

    // Validate request body
    const validatedData = salesInquirySchema.parse(req.body);
    console.log('Validated data:', validatedData);

    // Create new inquiry
    const inquiry = await SalesInquiry.create({
      ...validatedData,
      status: 'new',
      submittedAt: new Date(),
      updatedAt: new Date(),
      userId: req.auth.userId, // Store the user ID who created this inquiry
    });

    console.log('Created inquiry:', inquiry);
    return res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating sales inquiry:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create sales inquiry' });
  }
});

// Update sales inquiry status
handler.patch('/:id/status', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const inquiry = await SalesInquiry.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Sales inquiry not found' });
    }

    return res.json(inquiry);
  } catch (error) {
    console.error('Error updating sales inquiry:', error);
    return res.status(500).json({ error: 'Failed to update sales inquiry' });
  }
});

// Delete sales inquiry
handler.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const inquiry = await SalesInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({ error: 'Sales inquiry not found' });
    }

    return res.json({ message: 'Sales inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales inquiry:', error);
    return res.status(500).json({ error: 'Failed to delete sales inquiry' });
  }
});

export const salesInquiriesHandler = handler; 