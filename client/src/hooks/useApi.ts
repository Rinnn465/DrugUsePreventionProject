/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiOptions {
    immediate?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

// Generic hook for API calls with automatic state management
export function useApi<T>(
    apiCall: () => Promise<T>,
    dependencies: any[] = [],
    options: UseApiOptions = {}
) {
    const { immediate = true, onSuccess, onError } = options;

    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await apiCall();
            setState(prev => ({ ...prev, data: result, loading: false }));
            onSuccess?.(result);
            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            onError?.(error);
            throw error;
        }
    }, [apiCall, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate, ...dependencies]);

    const refetch = useCallback(() => {
        return execute();
    }, [execute]);

    return {
        ...state,
        refetch,
        execute,
    };
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useApiMutation<T, TVariables = any>(
    apiCall: (variables: TVariables) => Promise<T>,
    options: UseApiOptions = {}
) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(async (variables: TVariables) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await apiCall(variables);
            setState(prev => ({ ...prev, data: result, loading: false }));
            options.onSuccess?.(result);
            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
            options.onError?.(error);
            throw error;
        }
    }, [apiCall, options]);

    return {
        ...state,
        mutate,
        reset: () => setState({ data: null, loading: false, error: null }),
    };
}