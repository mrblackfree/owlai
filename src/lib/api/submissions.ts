import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://owl.io.kr';

interface ToolSubmission {
  _id: string;
  toolName: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  category: string;
  pricingType: string;
  keyHighlights: string[];
  twitterUrl?: string;
  githubUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  updatedAt: string;
}

interface SubmitToolData {
  toolName: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  category: string;
  pricingType: string;
  keyHighlights: string[];
  twitterUrl?: string;
  githubUrl?: string;
}

// Fetch all tool submissions
async function getToolSubmissions(token: string): Promise<ToolSubmission[]> {
  const response = await fetch(`${API_URL}/api/tools/submissions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tool submissions');
  }

  return response.json();
}

// Update tool submission status
async function updateToolSubmissionStatus(
  token: string,
  submissionId: string,
  status: 'approved' | 'rejected'
): Promise<ToolSubmission> {
  const response = await fetch(`${API_URL}/api/tools/${submissionId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update tool submission status');
  }

  return response.json();
}

// Transform the data to match API expectations
function transformToolData(data: SubmitToolData) {
  // Map pricing type to lowercase enum values
  const pricingTypeMap: { [key: string]: string } = {
    'Free': 'free',
    'Freemium': 'freemium',
    'Paid': 'paid',
    'Enterprise': 'enterprise',
    'Contact for Pricing': 'enterprise'
  };

  return {
    name: data.toolName,
    description: data.description,
    websiteUrl: data.websiteUrl,
    logoUrl: data.logoUrl,
    category: data.category,
    pricing: {
      type: pricingTypeMap[data.pricingType] || 'paid',
      details: null
    },
    features: data.keyHighlights,
    tags: [data.category],
    socialLinks: {
      twitter: data.twitterUrl || null,
      github: data.githubUrl || null
    }
  };
}

// Submit new tool
async function submitTool(data: SubmitToolData, token: string): Promise<ToolSubmission> {
  console.log('Submitting tool to:', `${API_URL}/api/tools`);
  
  const transformedData = transformToolData(data);
  console.log('Transformed submission data:', transformedData);

  const response = await fetch(`${API_URL}/api/tools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Submission error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData?.error || 'Failed to submit tool');
  }

  const result = await response.json();
  console.log('Submission successful:', result);
  return result;
}

// React Query hooks
export function useToolSubmissions() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['tool-submissions'],
    queryFn: async () => {
      const token = await getToken();
      return getToolSubmissions(token);
    },
  });
}

export function useUpdateToolSubmissionStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      status 
    }: { 
      submissionId: string; 
      status: 'approved' | 'rejected';
    }) => {
      const token = await getToken();
      return updateToolSubmissionStatus(token, submissionId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-submissions'] });
    },
  });
}

// React Query hook for submitting a new tool
export function useSubmitTool() {
  const { getToken } = useAuth();
  
  return useMutation({
    mutationFn: async (data: SubmitToolData) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      return submitTool(data, token);
    }
  });
} 
