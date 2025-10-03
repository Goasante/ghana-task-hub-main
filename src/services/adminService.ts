// Admin Service for Ghana Task Hub
import { apiService, API_ENDPOINTS, ApiResponse, PaginatedResponse } from './api';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'TASKER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED';
  isVerified: boolean;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    averageRating: number;
    totalEarnings?: number;
    totalSpent?: number;
  };
}

export interface KycDocument {
  id: string;
  userId: string;
  type: 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'UTILITY_BILL' | 'BANK_STATEMENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentUrl: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  metadata: {
    documentNumber?: string;
    expiryDate?: string;
    issueDate?: string;
    issuingAuthority?: string;
  };
}

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  status: 'CREATED' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isUrgent: boolean;
  priceGHS: number;
  platformFeeGHS: number;
  clientId: string;
  taskerId?: string;
  categoryId: string;
  scheduledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  tasker?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  category: {
    id: string;
    name: string;
  };
  address: {
    fullAddress: string;
    city: string;
    region: string;
  };
  payment?: {
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    amount: number;
    platformFee: number;
  };
}

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalTasks: number;
    totalRevenue: number;
    activeTaskers: number;
    pendingKyc: number;
    supportTickets: number;
  };
  userGrowth: {
    period: string;
    newUsers: number;
    activeUsers: number;
  }[];
  taskMetrics: {
    period: string;
    totalTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    averageCompletionTime: number;
  }[];
  revenueMetrics: {
    period: string;
    totalRevenue: number;
    platformFees: number;
    taskerPayouts: number;
  }[];
  categoryStats: {
    categoryId: string;
    categoryName: string;
    totalTasks: number;
    averagePrice: number;
    completionRate: number;
  }[];
  topTaskers: {
    taskerId: string;
    taskerName: string;
    totalTasks: number;
    averageRating: number;
    totalEarnings: number;
  }[];
  topClients: {
    clientId: string;
    clientName: string;
    totalTasks: number;
    totalSpent: number;
  }[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  type: 'GENERAL' | 'TECHNICAL' | 'PAYMENT' | 'TASK_ISSUE' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  messages: {
    id: string;
    senderId: string;
    senderType: 'USER' | 'ADMIN';
    content: string;
    createdAt: string;
  }[];
}

export interface SystemConfig {
  platformSettings: {
    platformFeePercentage: number;
    minimumTaskPrice: number;
    maximumTaskPrice: number;
    taskTimeoutHours: number;
    autoAssignEnabled: boolean;
    kycRequired: boolean;
    maintenanceMode: boolean;
  };
  paymentSettings: {
    supportedMethods: string[];
    escrowEnabled: boolean;
    payoutDelayHours: number;
    minimumPayoutAmount: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  securitySettings: {
    requireKycForTaskers: boolean;
    requireKycForClients: boolean;
    maxFailedLoginAttempts: number;
    sessionTimeoutMinutes: number;
  };
}

export class AdminService {
  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    kycStatus?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.kycStatus) queryParams.append('kycStatus', params.kycStatus);
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<AdminUser>>(endpoint);
  }

  async getUser(userId: string): Promise<ApiResponse<AdminUser>> {
    return apiService.get<AdminUser>(`/admin/users/${userId}`);
  }

  async updateUserStatus(userId: string, status: AdminUser['status'], reason?: string): Promise<ApiResponse<AdminUser>> {
    return apiService.patch<AdminUser>(`/admin/users/${userId}/status`, { status, reason });
  }

  async updateUserRole(userId: string, role: AdminUser['role']): Promise<ApiResponse<AdminUser>> {
    return apiService.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
  }

  // KYC Management
  async getKycDocuments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<KycDocument>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const endpoint = `/admin/kyc/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<KycDocument>>(endpoint);
  }

  async reviewKycDocument(documentId: string, decision: 'APPROVED' | 'REJECTED', reason?: string): Promise<ApiResponse<KycDocument>> {
    return apiService.patch<KycDocument>(`/admin/kyc/documents/${documentId}/review`, {
      decision,
      reason,
    });
  }

  async getUserKycDocuments(userId: string): Promise<ApiResponse<KycDocument[]>> {
    return apiService.get<KycDocument[]>(`/admin/users/${userId}/kyc`);
  }

  // Task Management
  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<AdminTask>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/admin/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<AdminTask>>(endpoint);
  }

  async getTask(taskId: string): Promise<ApiResponse<AdminTask>> {
    return apiService.get<AdminTask>(`/admin/tasks/${taskId}`);
  }

  async updateTaskStatus(taskId: string, status: AdminTask['status'], reason?: string): Promise<ApiResponse<AdminTask>> {
    return apiService.patch<AdminTask>(`/admin/tasks/${taskId}/status`, { status, reason });
  }

  async assignTaskToTasker(taskId: string, taskerId: string): Promise<ApiResponse<AdminTask>> {
    return apiService.patch<AdminTask>(`/admin/tasks/${taskId}/assign`, { taskerId });
  }

  async cancelTask(taskId: string, reason: string): Promise<ApiResponse<AdminTask>> {
    return apiService.patch<AdminTask>(`/admin/tasks/${taskId}/cancel`, { reason });
  }

  // Analytics
  async getAnalytics(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AdminAnalytics>> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/admin/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<AdminAnalytics>(endpoint);
  }

  // Support Management
  async getSupportTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<SupportTicket>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);

    const endpoint = `/admin/support/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<SupportTicket>>(endpoint);
  }

  async getSupportTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
    return apiService.get<SupportTicket>(`/admin/support/tickets/${ticketId}`);
  }

  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<ApiResponse<SupportTicket>> {
    return apiService.patch<SupportTicket>(`/admin/support/tickets/${ticketId}/status`, { status });
  }

  async assignTicket(ticketId: string, adminId: string): Promise<ApiResponse<SupportTicket>> {
    return apiService.patch<SupportTicket>(`/admin/support/tickets/${ticketId}/assign`, { adminId });
  }

  async replyToTicket(ticketId: string, content: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/admin/support/tickets/${ticketId}/reply`, { content });
  }

  // System Configuration
  async getSystemConfig(): Promise<ApiResponse<SystemConfig>> {
    return apiService.get<SystemConfig>('/admin/config');
  }

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<ApiResponse<SystemConfig>> {
    return apiService.patch<SystemConfig>('/admin/config', config);
  }

  // Utility Functions
  formatCurrency(amount: number, currency: string = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      ACTIVE: 'text-green-600',
      SUSPENDED: 'text-red-600',
      PENDING: 'text-yellow-600',
      REJECTED: 'text-red-600',
      APPROVED: 'text-green-600',
      NOT_SUBMITTED: 'text-gray-600',
      OPEN: 'text-blue-600',
      RESOLVED: 'text-green-600',
      CLOSED: 'text-gray-600',
      CREATED: 'text-blue-600',
      ASSIGNED: 'text-yellow-600',
      EN_ROUTE: 'text-purple-600',
      ON_SITE: 'text-orange-600',
      IN_PROGRESS: 'text-indigo-600',
      COMPLETED: 'text-green-600',
      CANCELLED: 'text-red-600',
      DISPUTED: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  }

  getPriorityColor(priority: string): string {
    const colors = {
      LOW: 'text-gray-600',
      MEDIUM: 'text-blue-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  }

  getRoleIcon(role: string): string {
    const icons = {
      CLIENT: '👤',
      TASKER: '🔧',
      ADMIN: '👑',
    };
    return icons[role] || '👤';
  }

  getKycTypeIcon(type: string): string {
    const icons = {
      ID_CARD: '🆔',
      PASSPORT: '📘',
      DRIVERS_LICENSE: '🚗',
      UTILITY_BILL: '⚡',
      BANK_STATEMENT: '🏦',
    };
    return icons[type] || '📄';
  }

  getSupportTypeIcon(type: string): string {
    const icons = {
      GENERAL: '💬',
      TECHNICAL: '🔧',
      PAYMENT: '💰',
      TASK_ISSUE: '📋',
      ACCOUNT: '👤',
      OTHER: '❓',
    };
    return icons[type] || '💬';
  }
}

// Export singleton instance
export const adminService = new AdminService();
