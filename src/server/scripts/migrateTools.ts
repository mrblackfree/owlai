import 'dotenv/config';
import connectDB from '../db/connection';
import { Tool } from '../db/models/Tool';
import { MOCK_PRODUCTS } from '../../data/mockData';
import mongoose from 'mongoose';

// Helper function to normalize pricing type
function normalizePricingType(type: string): 'free' | 'freemium' | 'paid' | 'enterprise' {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'free': return 'free';
    case 'freemium': return 'freemium';
    case 'premium':
    case 'paid': return 'paid';
    default: return 'enterprise';
  }
}

// Helper function to generate unique slug
function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen

  let slug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
}

// Helper function to get logo URL
async function getLogoUrl(website: string, name: string): Promise<string> {
  if (!website) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&format=svg`;
  }
  
  try {
    // Try Clearbit first
    const domain = website.replace(/^https?:\/\//, '').split('/')[0];
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    
    // Test if Clearbit has the logo
    const response = await fetch(clearbitUrl);
    if (response.ok) {
      return clearbitUrl;
    }
    
    // If Clearbit fails, fallback to UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&format=svg`;
  } catch (error) {
    // If anything fails, use UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&format=svg`;
  }
}

async function migrateTools() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully to MongoDB');

    // Keep track of used slugs
    const usedSlugs = new Set<string>();

    // Format tools data
    console.log('Formatting tools and fetching logos...');
    const formattedTools = await Promise.all(MOCK_PRODUCTS.map(async tool => ({
      _id: new mongoose.Types.ObjectId(parseInt(tool.id, 10).toString(16).padStart(24, '0')), // Generate consistent ObjectId
      name: tool.name,
      slug: generateUniqueSlug(tool.name, usedSlugs),
      description: tool.description,
      websiteUrl: tool.url,
      category: tool.category,
      tags: tool.tags,
      pricing: {
        type: normalizePricingType(tool.pricing.type),
        startingPrice: parseInt(tool.pricing.startingPrice?.replace(/[^0-9]/g, '') || '0'),
      },
      features: tool.features,
      status: 'published',
      isTrending: tool.isTrending || false,
      isNew: tool.isNew || false,
      views: parseInt(tool.views.replace(/[^0-9]/g, '')),
      votes: tool.votes,
      rating: tool.rating,
      reviews: tool.reviews,
      logo: await getLogoUrl(tool.website, tool.name)
    })));

    console.log('Formatted first tool:', JSON.stringify(formattedTools[0], null, 2));
    console.log('Total tools to migrate:', formattedTools.length);

    // Clear existing tools
    console.log('Clearing existing tools...');
    const deleteResult = await Tool.deleteMany({});
    console.log('Cleared existing tools:', deleteResult);

    // Insert all tools
    console.log('Inserting tools...');
    const insertResult = await Tool.insertMany(formattedTools);
    console.log('Successfully inserted tools. Count:', insertResult.length);

    // Verify migration
    const totalTools = await Tool.countDocuments();
    console.log('Total tools in database:', totalTools);

    const sampleTool = await Tool.findOne();
    console.log('Sample tool from database:', JSON.stringify(sampleTool, null, 2));

    // Log a sample URL to show how to access a tool
    if (sampleTool) {
      console.log('Example tool URL:', `/ai-tools/${sampleTool.slug}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed!');
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

migrateTools(); 