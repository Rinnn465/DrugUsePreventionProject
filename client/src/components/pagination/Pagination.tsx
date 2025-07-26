import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
    maxPagesToShow?: number;
    itemName?: string;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showInfo = true,
    maxPagesToShow = 5,
    itemName = "mục",
    className = ""
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfMaxPages = Math.floor(maxPagesToShow / 2);
            let startPage = Math.max(1, currentPage - halfMaxPages);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            // Adjust if we're near the end
            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Don't render if there's only one page or no items
    if (totalPages <= 1) return null;

    return (
        <div className={`bg-white px-6 py-4 border-t border-gray-200 ${className}`}>
            <div className="flex items-center justify-between">
                {/* Info text on the left */}
                {showInfo && (
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                        <span className="font-medium">{endIndex}</span> trong tổng số{' '}
                        <span className="font-medium">{totalItems}</span> {itemName}
                    </div>
                )}

                {/* Pagination controls on the right */}
                <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Trang trước"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => onPageChange(pageNumber)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pageNumber === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                aria-current={pageNumber === currentPage ? 'page' : undefined}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>

                    {/* Next button */}
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Trang sau"
                    >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile version */}
            <div className="sm:hidden mt-4 flex justify-between items-center">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>

                <span className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination;