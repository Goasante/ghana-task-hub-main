// Enhanced Authentication Store with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/services/models';
import { authService, AuthUser } from '@/services/authService';

// Define UserRole enum locally for compatibility
export enum UserRole {
  CLIENT = 'CLIENT',
  TASKER = 'TASKER',
  ADMIN = 'ADMIN'
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // OTP State
  otpPhone: string | null;
  otpSent: boolean;
  otpLoading: boolean;
  otpError: string | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  
  // OTP Actions
  requestOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  completeRegistration: (phone: string, otp: string, profileData: {
    firstName: string;
    lastName: string;
    email?: string;
    role: 'CLIENT' | 'TASKER';
  }) => Promise<boolean>;
  
  // Auth State Management
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // OTP State Management
  setOTPPhone: (phone: string | null) => void;
  setOTPSent: (sent: boolean) => void;
  setOTPLoading: (loading: boolean) => void;
  setOTPError: (error: string | null) => void;
  clearOTPError: () => void;
  clearOTPState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // OTP state
      otpPhone: null,
      otpSent: false,
      otpLoading: false,
      otpError: null,

      // Basic auth actions
      login: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true, 
          error: null 
        });
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: 'Logout failed' 
          });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, ...updates } 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // OTP Actions
      requestOTP: async (phone: string): Promise<boolean> => {
        set({ otpLoading: true, otpError: null });
        
        try {
          const response = await authService.requestOTP(phone);
          
          if (response.success) {
            set({ 
              otpPhone: phone,
              otpSent: true,
              otpLoading: false,
              otpError: null 
            });
            return true;
          } else {
            set({ 
              otpLoading: false,
              otpError: response.error || 'Failed to send OTP' 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({ 
            otpLoading: false,
            otpError: errorMessage 
          });
          return false;
        }
      },

      verifyOTP: async (phone: string, otp: string): Promise<boolean> => {
        set({ otpLoading: true, otpError: null });
        
        try {
          const response = await authService.verifyOTP(phone, otp);
          
          if (response.success && response.data) {
            const authUser = response.data;
            set({ 
              user: authUser,
              isAuthenticated: true,
              otpLoading: false,
              otpError: null,
              error: null 
            });
            return true;
          } else {
            set({ 
              otpLoading: false,
              otpError: response.error || 'Invalid OTP' 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({ 
            otpLoading: false,
            otpError: errorMessage 
          });
          return false;
        }
      },

      completeRegistration: async (
        phone: string, 
        otp: string, 
        profileData: {
          firstName: string;
          lastName: string;
          email?: string;
          role: 'CLIENT' | 'TASKER';
        }
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.completeProfile(phone, otp, profileData);
          
          if (response.success && response.data) {
            const authUser = response.data;
            set({ 
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              otpError: null 
            });
            return true;
          } else {
            set({ 
              isLoading: false,
              error: response.error || 'Registration failed' 
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({ 
            isLoading: false,
            error: errorMessage 
          });
          return false;
        }
      },

      // Auth state management
      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          const authUser = await authService.initializeAuth();
          
          if (authUser) {
            set({ 
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication initialization failed' 
          });
        }
      },

      refreshToken: async (): Promise<boolean> => {
        try {
          const response = await authService.refreshToken();
          
          if (response.success && response.data) {
            // Token refreshed successfully
            return true;
          } else {
            // Refresh failed, logout user
            await get().logout();
            return false;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          await get().logout();
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // OTP state management
      setOTPPhone: (phone: string | null) => {
        set({ otpPhone: phone });
      },

      setOTPSent: (sent: boolean) => {
        set({ otpSent: sent });
      },

      setOTPLoading: (loading: boolean) => {
        set({ otpLoading: loading });
      },

      setOTPError: (error: string | null) => {
        set({ otpError: error });
      },

      clearOTPError: () => {
        set({ otpError: null });
      },

      clearOTPState: () => {
        set({ 
          otpPhone: null,
          otpSent: false,
          otpLoading: false,
          otpError: null 
        });
      },
    }),
    {
      name: 'ghana-task-hub-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist loading states, errors, or OTP state
      }),
    }
  )
);