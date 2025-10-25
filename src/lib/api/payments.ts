import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface PaymentSessionRequest {
  planId: string;
  paymentMethod: 'stripe' | 'paypal';
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentSessionResponse {
  url: string;
  sessionId: string;
}

export interface Purchase {
  _id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal';
  paymentId: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'refunded';
  startDate: string;
  endDate: string;
  toolId?: string;
  toolName?: string;
  toolUrl?: string;
  placement: 'basic' | 'featured' | 'premium' | 'sponsored';
  features: string[];
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Create payment session
export const useCreatePaymentSession = () => {
  return useMutation({
    mutationFn: async (data: PaymentSessionRequest): Promise<PaymentSessionResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }
      
      return response.json();
    },
  });
};

// Verify payment session
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, paymentMethod }: { sessionId: string; paymentMethod: string }): Promise<Purchase> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, paymentMethod }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }
      
      const result = await response.json();
      // Handle backend response format: { success: true, data: purchase }
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
    },
  });
};

// Get user purchases
export const useUserPurchases = (userId?: string) => {
  return useQuery({
    queryKey: ['user-purchases', userId],
    queryFn: async (): Promise<Purchase[]> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/user-purchases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user purchases');
      }
      
      return response.json();
    },
    enabled: !!userId,
  });
};

// Get single purchase
export const usePurchase = (purchaseId: string) => {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async (): Promise<Purchase> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/purchase/${purchaseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase');
      }
      
      return response.json();
    },
    enabled: !!purchaseId,
  });
};

// Update purchase (for adding tool details)
export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      purchaseId, 
      data 
    }: { 
      purchaseId: string; 
      data: { 
        toolId?: string; 
        toolName?: string; 
        toolUrl?: string; 
        notes?: string;
      } 
    }): Promise<Purchase> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/purchase/${purchaseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update purchase');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
    },
  });
}; 