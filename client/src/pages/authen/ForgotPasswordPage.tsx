import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

interface ErrorResponse {
    message: string;
    field?: string;
    suggestion?: string;
    success?: boolean;
}

const ForgotPasswordPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverResponse, setServerResponse] = useState<ErrorResponse | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Không được để trống')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            setServerResponse(null);

            try {
                const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: values.email })
                });

                const data = await response.json();

                if (response.ok) {
                    setIsSuccess(true);
                    setServerResponse({
                        message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.',
                        success: true
                    });
                } else {
                    setServerResponse({
                        message: data.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.',
                        field: data.message === 'Email not found' ? 'email' : undefined,
                        suggestion: data.message === 'Email not found' ? 'register' : undefined
                    });
                }
            } catch (error) {
                console.error('Network error:', error);
                setServerResponse({
                    message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
                    field: 'network'
                });
            } finally {
                setIsLoading(false);
            }
        }
    })
    // Function to render response message
    const renderResponse = (response: ErrorResponse) => {
        const isSuccessMessage = response.success;
        const baseClasses = "mb-4 p-4 border rounded-md";
        const successClasses = "bg-green-50 border-green-200";
        const errorClasses = "bg-red-50 border-red-200";

        const getIcon = () => {
            if (isSuccessMessage) {
                return (
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            } else if (response.suggestion === 'register') {
                return (
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                );
            }
            return (
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 17.333 3.924 19 5.464 19z" />
                </svg>
            );
        };

        return (
            <div className={`${baseClasses} ${isSuccessMessage ? successClasses : errorClasses}`}>
                <div className="flex items-start">
                    <div className={isSuccessMessage ? "text-green-500" : "text-red-500"}>
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${isSuccessMessage ? "text-green-700" : "text-red-700"}`}>
                            {response.message}
                        </p>
                        {response.suggestion === 'register' && (
                            <div className="mt-2">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Đăng ký tài khoản mới
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>

            {/* Display server response */}
            {serverResponse && renderResponse(serverResponse)}

            {!isSuccess && (
                <div className="flex flex-col space-y-4">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                (formik.touched.email && formik.errors.email) || (serverResponse?.field === 'email')
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Nhập email của bạn"
                            onChange={(e) => {
                                formik.handleChange(e);
                                if (serverResponse) setServerResponse(null); // Clear server error on input change
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <p className="text-red-600 text-sm mt-1">
                                {formik.errors.email}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${
                            isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi liên kết để đặt lại mật khẩu'
                        )}
                    </button>
                </div>
            )}

            <div className="mt-6 text-center space-y-2">
                {isSuccess ? (
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Email đã được gửi thành công! Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setServerResponse(null);
                                formik.resetForm();
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            Gửi lại email khác
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600">
                            <Link to="/login" className="text-blue-500 hover:underline">
                                Quay về trang đăng nhập
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/signup" className="text-blue-500 hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </form>
    )
}

export default ForgotPasswordPage;