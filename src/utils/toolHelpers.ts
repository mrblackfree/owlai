import { Tool as ApiTool } from '@/types/tool';
import { Tool as MockTool, getToolLogoUrl as getMockToolLogoUrl } from '@/data/mockData';

/**
 * Safely get a tool's logo URL regardless of which Tool type is used
 */
export const getToolLogo = (tool: ApiTool | MockTool | undefined): string => {
  if (!tool) {
    return `https://ui-avatars.com/api/?name=Tool&background=6366f1&color=fff&bold=true&format=svg`;
  }

  // Check if it's the API Tool type (has logo property)
  if ('logo' in tool && tool.logo) {
    return tool.logo;
  }
  
  // Check if it's a Mock Tool type (has imageUrl property)
  if ('imageUrl' in tool && tool.imageUrl) {
    return tool.imageUrl;
  }
  
  // Check if it's a Mock Tool with website property
  if ('website' in tool && tool.website) {
    // Use the original function for mock data tools
    return getMockToolLogoUrl(tool as MockTool);
  }
  
  // Check if it's an API Tool with websiteUrl property
  if ('websiteUrl' in tool && tool.websiteUrl) {
    const domain = tool.websiteUrl.replace(/^https?:\/\//, '');
    return `https://logo.clearbit.com/${domain}`;
  }
  
  // Fallback to generating a logo from name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&format=svg`;
}; 