import React, { useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
    confirmMessage: string;
    confirmUrl: () => void;
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    confirmMessage,
    confirmUrl,
}) => {
    // Disable scrolling when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={onClose}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="mt-4">
                    <p className="text-gray-600">{description}</p>
                    {children}
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={confirmUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                        {confirmMessage}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;