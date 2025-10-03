// Payment Integration Hook
import { useState, useEffect, useCallback } from 'react';
import { paymentService, PaymentMethod, Transaction, Payout, PaymentAnalytics } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentsOptions {
  autoLoad?: boolean;
  userId?: string;
}

interface UsePaymentsReturn {
  // Payment Methods
  paymentMethods: PaymentMethod[];
  loadingMethods: boolean;
  addPaymentMethod: (methodData: any) => Promise<boolean>;
  removePaymentMethod: (methodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (methodId: string) => Promise<boolean>;
  
  // Transactions
  transactions: Transaction[];
  loadingTransactions: boolean;
  loadTransactions: (params?: any) => Promise<void>;
  
  // Payouts (for taskers)
  payouts: Payout[];
  loadingPayouts: boolean;
  loadPayouts: (params?: any) => Promise<void>;
  
  // Analytics
  analytics: PaymentAnalytics | null;
  loadingAnalytics: boolean;
  loadAnalytics: () => Promise<void>;
  
  // Payment Processing
  processPayment: (paymentData: any) => Promise<Transaction | null>;
  processingPayment: boolean;
  
  // Payout Processing
  requestPayout: (payoutData: any) => Promise<Payout | null>;
  processingPayout: boolean;
  
  // Utility Functions
  calculateFees: (amount: number, provider?: string) => {
    platform: number;
    processing: number;
    total: number;
    netAmount: number;
  };
  formatCurrency: (amount: number, currency?: string) => string;
  
  // Error Handling
  error: string | null;
  clearError: () => void;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const { autoLoad = true, userId } = options;
  const { user } = useAuthStore();
  const { toast } = useToast();

  // State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || user?.id;

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    if (!currentUserId) return;

    setLoadingMethods(true);
    setError(null);
    
    try {
      const response = await paymentService.getPaymentMethods(currentUserId);
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        throw new Error(response.error || 'Failed to load payment methods');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment methods';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingMethods(false);
    }
  }, [currentUserId, toast]);

  // Load transactions
  const loadTransactions = useCallback(async (params?: any) => {
    if (!currentUserId) return;

    setLoadingTransactions(true);
    setError(null);
    
    try {
      const response = await paymentService.getTransactions(currentUserId, params);
      if (response.success && response.data) {
        setTransactions(Array.isArray(response.data) ? response.data : response.data.data);
      } else {
        throw new Error(response.error || 'Failed to load transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentUserId, toast]);

  // Load payouts
  const loadPayouts = useCallback(async (params?: any) => {
    if (!currentUserId || user?.role !== 'TASKER') return;

    setLoadingPayouts(true);
    setError(null);
    
    try {
      const response = await paymentService.getPayouts(currentUserId, params);
      if (response.success && response.data) {
        setPayouts(Array.isArray(response.data) ? response.data : response.data.data);
      } else {
        throw new Error(response.error || 'Failed to load payouts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payouts';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingPayouts(false);
    }
  }, [currentUserId, user?.role, toast]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    if (!currentUserId) return;

    setLoadingAnalytics(true);
    setError(null);
    
    try {
      const response = await paymentService.getPaymentAnalytics({ userId: currentUserId });
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.error || 'Failed to load analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [currentUserId, toast]);

  // Add payment method
  const addPaymentMethod = useCallback(async (methodData: any): Promise<boolean> => {
    if (!currentUserId) return false;

    setLoadingMethods(true);
    setError(null);
    
    try {
      const response = await paymentService.addPaymentMethod(currentUserId, methodData);
      if (response.success && response.data) {
        setPaymentMethods(prev => [...prev, response.data!]);
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to add payment method');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingMethods(false);
    }
  }, [currentUserId, toast]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (methodId: string): Promise<boolean> => {
    if (!currentUserId) return false;

    setLoadingMethods(true);
    setError(null);
    
    try {
      const response = await paymentService.removePaymentMethod(currentUserId, methodId);
      if (response.success) {
        setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
        toast({
          title: "Success",
          description: "Payment method removed successfully",
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to remove payment method');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingMethods(false);
    }
  }, [currentUserId, toast]);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (methodId: string): Promise<boolean> => {
    if (!currentUserId) return false;

    setLoadingMethods(true);
    setError(null);
    
    try {
      const response = await paymentService.setDefaultPaymentMethod(currentUserId, methodId);
      if (response.success && response.data) {
        setPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            isDefault: method.id === methodId
          }))
        );
        toast({
          title: "Success",
          description: "Default payment method updated",
        });
        return true;
      } else {
        throw new Error(response.error || 'Failed to set default payment method');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingMethods(false);
    }
  }, [currentUserId, toast]);

  // Process payment
  const processPayment = useCallback(async (paymentData: any): Promise<Transaction | null> => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Create payment intent
      const intentResponse = await paymentService.createPaymentIntent(paymentData);
      if (!intentResponse.success || !intentResponse.data) {
        throw new Error(intentResponse.error || 'Failed to create payment intent');
      }

      // Confirm payment
      const confirmResponse = await paymentService.confirmPayment(
        intentResponse.data.id,
        paymentData.confirmationData || {}
      );

      if (confirmResponse.success && confirmResponse.data) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
        
        // Refresh transactions
        await loadTransactions();
        
        return confirmResponse.data;
      } else {
        throw new Error(confirmResponse.error || 'Payment confirmation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessingPayment(false);
    }
  }, [toast, loadTransactions]);

  // Request payout
  const requestPayout = useCallback(async (payoutData: any): Promise<Payout | null> => {
    if (!currentUserId || user?.role !== 'TASKER') return null;

    setProcessingPayout(true);
    setError(null);
    
    try {
      const response = await paymentService.requestPayout({
        ...payoutData,
        taskerId: currentUserId,
      });

      if (response.success && response.data) {
        toast({
          title: "Payout Requested",
          description: "Your payout request has been submitted successfully",
        });
        
        // Refresh payouts
        await loadPayouts();
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to request payout');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request payout';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessingPayout(false);
    }
  }, [currentUserId, user?.role, toast, loadPayouts]);

  // Utility functions
  const calculateFees = useCallback((amount: number, provider?: string) => {
    const platformFee = paymentService.calculatePlatformFee(amount);
    const processingFee = provider ? paymentService.calculateProcessingFee(amount, provider) : 0;
    const totalFees = platformFee + processingFee;
    const netAmount = amount - totalFees;

    return {
      platform: platformFee,
      processing: processingFee,
      total: totalFees,
      netAmount,
    };
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'GHS') => {
    return paymentService.formatCurrency(amount, currency);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load data
  useEffect(() => {
    if (autoLoad && currentUserId) {
      loadPaymentMethods();
      loadTransactions();
      loadAnalytics();
      
      if (user?.role === 'TASKER') {
        loadPayouts();
      }
    }
  }, [autoLoad, currentUserId, user?.role, loadPaymentMethods, loadTransactions, loadPayouts, loadAnalytics]);

  return {
    // Payment Methods
    paymentMethods,
    loadingMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    
    // Transactions
    transactions,
    loadingTransactions,
    loadTransactions,
    
    // Payouts
    payouts,
    loadingPayouts,
    loadPayouts,
    
    // Analytics
    analytics,
    loadingAnalytics,
    loadAnalytics,
    
    // Payment Processing
    processPayment,
    processingPayment,
    
    // Payout Processing
    requestPayout,
    processingPayout,
    
    // Utility Functions
    calculateFees,
    formatCurrency,
    
    // Error Handling
    error,
    clearError,
  };
}
