import { useState, useEffect } from 'react';

interface UsePaginationProps<T> {
    data: T[];
    itemsPerPage: number;
    resetTriggers?: any[];
}

interface UsePaginationReturn<T> {
    currentPage: number;
    totalPages: number;
    currentItems: T[];
    setCurrentPage: (page: number) => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
}

export const usePagination = <T>({
    data,
    itemsPerPage,
    resetTriggers = []
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to first page when dependencies change - FIX: spread the resetTriggers
    useEffect(() => {
        setCurrentPage(1);
    }, [...resetTriggers]); // This was the main issue

    // Calculate pagination values
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    // Ensure current page is valid
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return {
        currentPage,
        totalPages,
        currentItems,
        setCurrentPage,
        startIndex,
        endIndex,
        totalItems
    };
};