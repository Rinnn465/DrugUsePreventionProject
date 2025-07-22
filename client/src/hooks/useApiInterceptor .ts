import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useApiInterceptor = () => {
  const { setUser } = useUser();

  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override fetch to intercept responses
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check if response indicates account is disabled
      if (response.status === 403) {
        try {
          const data = await response.clone().json();
          if (data.message?.includes('vô hiệu hóa')) {
            // Account is disabled, logout user
            setUser(null);
            localStorage.clear();
            toast.error('Tài khoản của bạn đã bị vô hiệu hóa.');
            window.location.href = '/login';
          }
        } catch {
          // If response is not JSON, ignore
        }
      }
      
      return response;
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [setUser]);
};
