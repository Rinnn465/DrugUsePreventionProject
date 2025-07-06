import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

interface ErrorResponse {
    message: string;
    field?: string;
    suggestion?: string;
    success?: boolean;
}

const ResetPasswordPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverResponse, setServerResponse] = useState<ErrorResponse | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setServerResponse({
                    message: 'Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.',
                    suggestion: 'forgot-password'
                });
                setIsValidating(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (data.valid) {
                    setIsValidToken(true);
                } else {
                    setServerResponse({
                        message: data.message ?? 'Token đã hết hạn hoặc không hợp lệ.',
                        suggestion: 'forgot-password'
                    });
                }
            } catch (error) {
                console.error('Token validation error:', error);
                setServerResponse({
                    message: 'Không thể xác thực token. Vui lòng thử lại sau.',
                    field: 'network'
                });
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
                .required('Không được để trống'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
                .required('Không được để trống')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            setServerResponse(null);

            try {
                const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setIsSuccess(true);
                    setServerResponse({
                        message: 'Mật khẩu đã được đặt lại thành công!',
                        success: true
                    });
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setServerResponse({
                        message: data.message ?? 'Có lỗi xảy ra khi đặt lại mật khẩu.',
                        suggestion: data.message?.includes('expired') ? 'forgot-password' : undefined
                    });
                }
            } catch (error) {
                console.error('Reset password error:', error);
                setServerResponse({
                    message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
                    field: 'network'
                });
            } finally {
                setIsLoading(false);
            }
        }
    });

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
                        {response.suggestion === 'forgot-password' && (
                            <div className="mt-2">
                                <Link
                                    to="/forgot-password"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Yêu cầu đặt lại mật khẩu mới
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Loading state while validating token
    if (isValidating) {
        return (
            <div className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Đang xác thực...</h2>
                    <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>

            {/* Display server response */}
            {serverResponse && renderResponse(serverResponse)}

            {isValidToken && !isSuccess && (
                <div className="flex flex-col space-y-4">
                    {/* New Password Field */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới
                        </label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formik.touched.newPassword && formik.errors.newPassword
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Nhập mật khẩu mới"
                            onChange={(e) => {
                                formik.handleChange(e);
                                if (serverResponse) setServerResponse(null);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.newPassword}
                        />
                        {formik.touched.newPassword && formik.errors.newPassword ? (
                            <p className="text-red-600 text-sm mt-1">
                                {formik.errors.newPassword}
                            </p>
                        ) : null}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                formik.touched.confirmPassword && formik.errors.confirmPassword
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Nhập lại mật khẩu mới"
                            onChange={(e) => {
                                formik.handleChange(e);
                                if (serverResponse) setServerResponse(null);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.confirmPassword}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <p className="text-red-600 text-sm mt-1">
                                {formik.errors.confirmPassword}
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
                                Đang cập nhật...
                            </>
                        ) : (
                            'Đặt lại mật khẩu'
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Đăng nhập ngay
                        </Link>
                    </div>
                ) : (
                    !isValidToken && (
                        <>
                            <p className="text-sm text-gray-600">
                                <Link to="/forgot-password" className="text-blue-500 hover:underline">
                                    Yêu cầu đặt lại mật khẩu mới
                                </Link>
                            </p>
                            <p className="text-sm text-gray-600">
                                <Link to="/login" className="text-blue-500 hover:underline">
                                    Quay về trang đăng nhập
                                </Link>
                            </p>
                        </>
                    )
                )}
            </div>
        </form>
    )
}

export default ResetPasswordPage;
