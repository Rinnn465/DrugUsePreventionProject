import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value over a specified delay.
 * @param {any} value - The input value to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {any} - The debounced value.
 */
function useDebounce(value: string, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);

        return () => clearTimeout(timer); // Cleanup on value/delay change or unmount
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
