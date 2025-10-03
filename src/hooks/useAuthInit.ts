// Authentication initialization hook
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuthInit() {
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize authentication when app starts
    initializeAuth();
  }, [initializeAuth]);

  return {
    isLoading,
  };
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  return {
    isAuthenticated,
    isLoading,
    user,
    isClient: user?.role === 'CLIENT',
    isTasker: user?.role === 'TASKER',
    isAdmin: user?.role === 'ADMIN',
  };
}

// Hook for auth status
export function useAuthStatus() {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    error,
    logout 
  } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    logout,
    isClient: user?.role === 'CLIENT',
    isTasker: user?.role === 'TASKER',
    isAdmin: user?.role === 'ADMIN',
    userInitials: user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '',
    userDisplayName: user ? `${user.firstName} ${user.lastName}` : '',
  };
}
