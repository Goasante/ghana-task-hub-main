// Custom hook for API calls with loading states and error handling
import { useState, useCallback } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<{ data: T; success: boolean; error?: string }>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'An error occurred',
        });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for multiple API calls
export function useMultipleApi<T>(
  apiFunctions: Array<(...args: any[]) => Promise<{ data: T; success: boolean; error?: string }>>
): {
  states: Array<UseApiState<T>>;
  execute: (index: number, ...args: any[]) => Promise<T | null>;
  executeAll: (...args: any[]) => Promise<T[]>;
  reset: () => void;
} {
  const [states, setStates] = useState<UseApiState<T>[]>(
    apiFunctions.map(() => ({
      data: null,
      loading: false,
      error: null,
    }))
  );

  const execute = useCallback(async (index: number, ...args: any[]): Promise<T | null> => {
    setStates(prev => prev.map((state, i) => 
      i === index ? { ...state, loading: true, error: null } : state
    ));
    
    try {
      const response = await apiFunctions[index](...args);
      
      if (response.success) {
        setStates(prev => prev.map((state, i) => 
          i === index 
            ? { data: response.data, loading: false, error: null }
            : state
        ));
        return response.data;
      } else {
        setStates(prev => prev.map((state, i) => 
          i === index 
            ? { data: null, loading: false, error: response.error || 'An error occurred' }
            : state
        ));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setStates(prev => prev.map((state, i) => 
        i === index 
          ? { data: null, loading: false, error: errorMessage }
          : state
      ));
      return null;
    }
  }, [apiFunctions]);

  const executeAll = useCallback(async (...args: any[]): Promise<T[]> => {
    const results = await Promise.all(
      apiFunctions.map((fn, index) => execute(index, ...args))
    );
    return results.filter((result): result is Awaited<T> => result !== null);
  }, [execute]);

  const reset = useCallback(() => {
    setStates(apiFunctions.map(() => ({
      data: null,
      loading: false,
      error: null,
    })));
  }, [apiFunctions]);

  return {
    states,
    execute,
    executeAll,
    reset,
  };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number, ...args: any[]) => Promise<{ 
    data: { data: T[]; total: number; page: number; limit: number; totalPages: number }; 
    success: boolean; 
    error?: string 
  }>
): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  loadPage: (page: number, ...args: any[]) => Promise<void>;
  loadNext: (...args: any[]) => Promise<void>;
  loadPrevious: (...args: any[]) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState({
    data: [] as T[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    loading: false,
    error: null as string | null,
  });

  const loadPage = useCallback(async (page: number, ...args: any[]): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiFunction(page, state.limit, ...args);
      
      if (response.success) {
        setState({
          data: response.data.data,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'An error occurred',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [apiFunction, state.limit]);

  const loadNext = useCallback(async (...args: any[]): Promise<void> => {
    if (state.page < state.totalPages) {
      await loadPage(state.page + 1, ...args);
    }
  }, [loadPage, state.page, state.totalPages]);

  const loadPrevious = useCallback(async (...args: any[]): Promise<void> => {
    if (state.page > 1) {
      await loadPage(state.page - 1, ...args);
    }
  }, [loadPage, state.page]);

  const reset = useCallback(() => {
    setState({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    loadPage,
    loadNext,
    loadPrevious,
    reset,
  };
}
