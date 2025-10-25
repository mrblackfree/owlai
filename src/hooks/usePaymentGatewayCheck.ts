import { usePublicPaymentConfig } from '@/lib/api/paymentSettings';

export interface PaymentGatewayStatus {
  isAnyEnabled: boolean;
  isStripeEnabled: boolean;
  isPayPalEnabled: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function usePaymentGatewayCheck(): PaymentGatewayStatus {
  const { data: config, isLoading, error } = usePublicPaymentConfig();

  const isStripeEnabled = config?.stripe?.enabled || false;
  const isPayPalEnabled = config?.paypal?.enabled || false;
  const isAnyEnabled = isStripeEnabled || isPayPalEnabled;

  return {
    isAnyEnabled,
    isStripeEnabled,
    isPayPalEnabled,
    isLoading,
    error
  };
}
