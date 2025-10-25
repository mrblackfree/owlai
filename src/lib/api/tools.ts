import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Tool } from '@/types/tool';

const API_URL = import.meta.env.VITE_API_URL || 'https://owl.io.kr';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ToolsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  pricing?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API functions
async function getTools(params: ToolsQueryParams = {}): Promise<PaginatedResponse<Tool>> {
  const searchParams = new URLSearchParams();
  
  // Add parameters to search params
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.pricing) searchParams.set('pricing', params.pricing);
  if (params.status) searchParams.set('status', params.status);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  console.log('Fetching tools with params:', params);
  const response = await fetch(`${API_URL}/api/tools?${searchParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Error fetching tools:', errorData);
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Received paginated tools data:', data);
  
  // Handle backward compatibility - if data is an array, wrap it in pagination structure
  if (Array.isArray(data)) {
    return {
      data,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: data.length,
        limit: data.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
  
  return data;
}

// Keep backward compatibility function
async function getAllTools(): Promise<Tool[]> {
  const response = await getTools({ limit: 10000 }); // Large limit for backward compatibility
  return response.data;
}

async function searchTools(query: string, limit: number = 10): Promise<Tool[]> {
  if (!query.trim()) return [];
  
  console.log('Searching tools for:', query);
  const response = await fetch(`${API_URL}/api/tools?search=${encodeURIComponent(query)}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Error searching tools:', errorData);
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Search results:', data);
  return data;
}

async function createTool(token: string, toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) {
  const response = await fetch(`${API_URL}/api/tools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toolData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function updateTool(token: string, toolId: string, toolData: Partial<Tool>) {
  const response = await fetch(`${API_URL}/api/tools/${toolId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toolData),
  });

  if (!response.ok) {
    throw new Error('Failed to update tool');
  }

  return response.json();
}

async function deleteTool(token: string, toolId: string) {
  const response = await fetch(`${API_URL}/api/tools/${toolId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete tool');
  }

  return response.json();
}

async function updateToolStatus(token: string, toolId: string, status: Tool['status']) {
  const response = await fetch(`${API_URL}/api/tools/${toolId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update tool status');
  }

  return response.json();
}

// React Query hooks
export function useTools(params: ToolsQueryParams = {}) {
  return useQuery({
    queryKey: ['tools', params],
    queryFn: () => getTools(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - cache longer for admin searches
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1, // Only retry once on failure for faster error handling
  });
}

// Backward compatibility hook for components that need all tools
export function useAllTools() {
  return useQuery({
    queryKey: ['all-tools'],
    queryFn: getAllTools,
    staleTime: 10 * 60 * 1000, // 10 minutes for all tools
  });
}

export function useSearchTools(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ['search-tools', query, limit],
    queryFn: () => searchTools(query, limit),
    enabled: !!query.trim(), // Only run query if search term exists
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

export function useCreateTool() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => {
      const token = await getToken();
      return createTool(token, toolData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

export function useUpdateTool() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      toolId, 
      data 
    }: { 
      toolId: string; 
      data: Partial<Tool>; 
    }) => {
      const token = await getToken();
      return updateTool(token, toolId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

export function useDeleteTool() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toolId: string) => {
      const token = await getToken();
      return deleteTool(token, toolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

export function useUpdateToolStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      toolId, 
      status 
    }: { 
      toolId: string; 
      status: Tool['status']; 
    }) => {
      const token = await getToken();
      return updateToolStatus(token, toolId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
} 
