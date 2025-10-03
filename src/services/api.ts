// API Service Layer for Ghana Task Hub
// This will handle all backend communication

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // For development, we'll use a mock backend
    // In production, this would be your actual API URL
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    ASSIGN: (id: string) => `/tasks/${id}/assign`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    GET: (id: string) => `/categories/${id}`,
  },
  
  // Taskers
  TASKERS: {
    LIST: '/taskers',
    PROFILE: (id: string) => `/taskers/${id}`,
    SEARCH: '/taskers/search',
  },
  
  // Messages
  MESSAGES: {
    LIST: (taskId: string) => `/tasks/${taskId}/messages`,
    SEND: (taskId: string) => `/tasks/${taskId}/messages`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    INTENTS: '/payments/intents',
    TRANSACTIONS: '/payments/transactions',
    WEBHOOKS: '/payments/webhooks',
    ANALYTICS: '/payments/analytics',
    ESCROW: '/payments/escrow',
    PAYOUTS: '/payments/payouts',
  },
  
  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    LIST: (userId: string) => `/users/${userId}/reviews`,
  },
} as const;
