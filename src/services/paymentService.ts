// Payment Service for Ghana Task Hub
import { apiService, API_ENDPOINTS, ApiResponse, PaginatedResponse } from './api';

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
  provider: 'PAYSTACK' | 'FLUTTERWAVE' | 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY';
  details: {
    last4?: string;
    brand?: string;
    phoneNumber?: string;
    network?: string;
  };
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: PaymentMethod;
  clientSecret?: string;
  redirectUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  type: 'PAYMENT' | 'PAYOUT' | 'REFUND' | 'PLATFORM_FEE';
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  reference: string;
  paymentMethod?: PaymentMethod;
  taskId?: string;
  userId: string;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface PayoutMethod {
  id: string;
  type: 'MOBILE_MONEY' | 'BANK_ACCOUNT';
  provider: 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY' | 'GHC_BANK';
  details: {
    phoneNumber?: string;
    accountNumber?: string;
    bankCode?: string;
    accountName?: string;
  };
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payoutMethod: PayoutMethod;
  taskerId: string;
  taskId?: string;
  reference: string;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  netAmount: number;
  description: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface EscrowAccount {
  id: string;
  taskId: string;
  amount: number;
  currency: string;
  status: 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';
  clientId: string;
  taskerId?: string;
  platformFee: number;
  netAmount: number;
  lockedAt: string;
  releasedAt?: string;
  metadata?: Record<string, any>;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  netRevenue: number;
  averageTransactionValue: number;
  successRate: number;
  paymentMethodBreakdown: Record<string, number>;
  dailyVolume: Array<{
    date: string;
    volume: number;
    transactions: number;
  }>;
}

export class PaymentService {
  // Payment Methods
  async getPaymentMethods(userId: string): Promise<ApiResponse<PaymentMethod[]>> {
    return apiService.get<PaymentMethod[]>(`${API_ENDPOINTS.PAYMENTS.BASE}/users/${userId}/methods`);
  }

  async addPaymentMethod(userId: string, methodData: {
    type: PaymentMethod['type'];
    provider: PaymentMethod['provider'];
    details: PaymentMethod['details'];
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiService.post<PaymentMethod>(`${API_ENDPOINTS.PAYMENTS.BASE}/users/${userId}/methods`, methodData);
  }

  async removePaymentMethod(userId: string, methodId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${API_ENDPOINTS.PAYMENTS.BASE}/users/${userId}/methods/${methodId}`);
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<ApiResponse<PaymentMethod>> {
    return apiService.patch<PaymentMethod>(`${API_ENDPOINTS.PAYMENTS.BASE}/users/${userId}/methods/${methodId}/default`);
  }

  // Payment Processing
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    taskId: string;
    paymentMethodId: string;
    description: string;
  }): Promise<ApiResponse<PaymentIntent>> {
    return apiService.post<PaymentIntent>(`${API_ENDPOINTS.PAYMENTS.BASE}/intents`, data);
  }

  async confirmPayment(paymentIntentId: string, paymentData?: {
    otp?: string;
    pin?: string;
    authorization?: any;
  }): Promise<ApiResponse<Transaction>> {
    return apiService.post<Transaction>(`${API_ENDPOINTS.PAYMENTS.BASE}/intents/${paymentIntentId}/confirm`, paymentData);
  }

  async cancelPayment(paymentIntentId: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${API_ENDPOINTS.PAYMENTS.BASE}/intents/${paymentIntentId}/cancel`);
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<ApiResponse<Transaction>> {
    return apiService.post<Transaction>(`${API_ENDPOINTS.PAYMENTS.BASE}/transactions/${transactionId}/refund`, {
      amount,
      reason,
    });
  }

  // Escrow Management
  async createEscrowAccount(data: {
    taskId: string;
    amount: number;
    currency: string;
    clientId: string;
    platformFee: number;
  }): Promise<ApiResponse<EscrowAccount>> {
    return apiService.post<EscrowAccount>(`${API_ENDPOINTS.PAYMENTS.BASE}/escrow`, data);
  }

  async releaseEscrow(escrowId: string, taskerId: string): Promise<ApiResponse<EscrowAccount>> {
    return apiService.post<EscrowAccount>(`${API_ENDPOINTS.PAYMENTS.BASE}/escrow/${escrowId}/release`, { taskerId });
  }

  async disputeEscrow(escrowId: string, reason: string): Promise<ApiResponse<EscrowAccount>> {
    return apiService.post<EscrowAccount>(`${API_ENDPOINTS.PAYMENTS.BASE}/escrow/${escrowId}/dispute`, { reason });
  }

  async refundEscrow(escrowId: string, reason: string): Promise<ApiResponse<EscrowAccount>> {
    return apiService.post<EscrowAccount>(`${API_ENDPOINTS.PAYMENTS.BASE}/escrow/${escrowId}/refund`, { reason });
  }

  // Payout Management
  async getPayoutMethods(taskerId: string): Promise<ApiResponse<PayoutMethod[]>> {
    return apiService.get<PayoutMethod[]>(`${API_ENDPOINTS.PAYMENTS.BASE}/taskers/${taskerId}/payout-methods`);
  }

  async addPayoutMethod(taskerId: string, methodData: {
    type: PayoutMethod['type'];
    provider: PayoutMethod['provider'];
    details: PayoutMethod['details'];
  }): Promise<ApiResponse<PayoutMethod>> {
    return apiService.post<PayoutMethod>(`${API_ENDPOINTS.PAYMENTS.BASE}/taskers/${taskerId}/payout-methods`, methodData);
  }

  async removePayoutMethod(taskerId: string, methodId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${API_ENDPOINTS.PAYMENTS.BASE}/taskers/${taskerId}/payout-methods/${methodId}`);
  }

  async requestPayout(data: {
    taskerId: string;
    amount: number;
    payoutMethodId: string;
    description: string;
  }): Promise<ApiResponse<Payout>> {
    return apiService.post<Payout>(`${API_ENDPOINTS.PAYMENTS.BASE}/payouts`, data);
  }

  async getPayouts(taskerId: string, params?: {
    status?: Payout['status'];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Payout>>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `${API_ENDPOINTS.PAYMENTS.BASE}/taskers/${taskerId}/payouts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<Payout>>(endpoint);
  }

  // Transactions
  async getTransactions(userId: string, params?: {
    type?: Transaction['type'];
    status?: Transaction['status'];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `${API_ENDPOINTS.PAYMENTS.BASE}/users/${userId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<Transaction>>(endpoint);
  }

  async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    return apiService.get<Transaction>(`${API_ENDPOINTS.PAYMENTS.BASE}/transactions/${transactionId}`);
  }

  // Analytics
  async getPaymentAnalytics(params?: {
    userId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<PaymentAnalytics>> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.dateRange?.start) queryParams.append('startDate', params.dateRange.start);
    if (params?.dateRange?.end) queryParams.append('endDate', params.dateRange.end);
    
    const endpoint = `${API_ENDPOINTS.PAYMENTS.BASE}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaymentAnalytics>(endpoint);
  }

  // Utility Functions
  calculatePlatformFee(amount: number): number {
    return Math.round(amount * 0.1 * 100) / 100; // 10% platform fee
  }

  calculateProcessingFee(amount: number, provider: string): number {
    const fees = {
      PAYSTACK: 0.035, // 3.5%
      FLUTTERWAVE: 0.04, // 4%
      MTN_MOMO: 0.015, // 1.5%
      VODAFONE_CASH: 0.015, // 1.5%
      AIRTELTIGO_MONEY: 0.015, // 1.5%
    };
    return Math.round(amount * (fees[provider] || 0.035) * 100) / 100;
  }

  calculateNetAmount(amount: number, provider: string): number {
    const platformFee = this.calculatePlatformFee(amount);
    const processingFee = this.calculateProcessingFee(amount, provider);
    return Math.round((amount - platformFee - processingFee) * 100) / 100;
  }

  formatCurrency(amount: number, currency: string = 'GHS'): string {
    const symbol = currency === 'GHS' ? '₵' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  formatPhoneNumber(phone: string): string {
    // Format Ghana phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+233${cleaned.slice(1)}`;
    } else if (cleaned.length === 9) {
      return `+233${cleaned}`;
    }
    return phone;
  }

  validateMobileMoneyNumber(phone: string, provider: string): { isValid: boolean; error?: string } {
    const cleaned = phone.replace(/\D/g, '');
    
    if (provider === 'MTN_MOMO') {
      if (!cleaned.startsWith('24') && !cleaned.startsWith('54') && !cleaned.startsWith('55')) {
        return { isValid: false, error: 'Invalid MTN MoMo number' };
      }
    } else if (provider === 'VODAFONE_CASH') {
      if (!cleaned.startsWith('20')) {
        return { isValid: false, error: 'Invalid Vodafone Cash number' };
      }
    } else if (provider === 'AIRTELTIGO_MONEY') {
      if (!cleaned.startsWith('26') && !cleaned.startsWith('56')) {
        return { isValid: false, error: 'Invalid AirtelTigo Money number' };
      }
    }

    if (cleaned.length !== 9) {
      return { isValid: false, error: 'Phone number must be 9 digits' };
    }

    return { isValid: true };
  }

  getPaymentMethodIcon(provider: string): string {
    const icons = {
      PAYSTACK: '/icons/paystack.svg',
      FLUTTERWAVE: '/icons/flutterwave.svg',
      MTN_MOMO: '/icons/mtn-momo.svg',
      VODAFONE_CASH: '/icons/vodafone-cash.svg',
      AIRTELTIGO_MONEY: '/icons/airteltigo-money.svg',
      VISA: '/icons/visa.svg',
      MASTERCARD: '/icons/mastercard.svg',
    };
    return icons[provider] || '/icons/payment.svg';
  }

  getPaymentMethodName(provider: string): string {
    const names = {
      PAYSTACK: 'Paystack',
      FLUTTERWAVE: 'Flutterwave',
      MTN_MOMO: 'MTN MoMo',
      VODAFONE_CASH: 'Vodafone Cash',
      AIRTELTIGO_MONEY: 'AirtelTigo Money',
      VISA: 'Visa',
      MASTERCARD: 'Mastercard',
    };
    return names[provider] || provider;
  }

  getPaymentStatusColor(status: string): string {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Webhook handlers (for production)
  async handlePaymentWebhook(payload: any, signature: string): Promise<ApiResponse<void>> {
    // Note: This would need to be implemented in the apiService to support custom headers
    // For now, we'll use a basic POST request
    return apiService.post<void>(`${API_ENDPOINTS.PAYMENTS.BASE}/webhooks`, payload);
  }

  // Mock functions for development
  async mockPayment(method: 'success' | 'failure' | 'pending' = 'success'): Promise<ApiResponse<Transaction>> {
    const mockTransaction: Transaction = {
      id: `mock_${Date.now()}`,
      type: 'PAYMENT',
      amount: 100,
      currency: 'GHS',
      status: method === 'success' ? 'COMPLETED' : method === 'failure' ? 'FAILED' : 'PENDING',
      description: 'Mock payment transaction',
      reference: `MOCK_${Date.now()}`,
      userId: 'mock_user',
      fees: {
        platform: 10,
        processing: 3.5,
        total: 13.5,
      },
      createdAt: new Date().toISOString(),
      completedAt: method === 'success' ? new Date().toISOString() : undefined,
    };

    return {
      data: mockTransaction,
      success: true,
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
